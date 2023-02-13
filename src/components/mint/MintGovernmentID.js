import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../vouched-css-customization.css";
import "react-phone-number-input/style.css";
import loadVouched from "../../load-vouched";
import PhoneNumberForm from "../atoms/PhoneNumberForm";
import MintButton from "./mint-button";
import StoreCredentials from "./store-credentials";
import StepSuccess from "./StepSuccess";
import { idServerUrl, maxDailyVouchedJobCount } from "../../constants";
import MintContainer from "./MintContainer";

const StepIDV = ({ phoneNumber }) => {
  useEffect(() => {
    (async () => {
      const resp = await fetch(`${idServerUrl}/vouched/job-count`);
      const data = await resp.json();
      if (data?.today >= maxDailyVouchedJobCount) {
        alert("Sorry, we cannot verify any more IDs at this time");
        return;
      }
      loadVouched(phoneNumber);
    })();
  }, []);

  if (!phoneNumber) {
    return <p>No phone number specified</p>
  }
  return (
    <>
      <h3 style={{ marginBottom: "25px", marginTop: "-25px" }}>
        Verify your ID
      </h3>
      <div id="vouched-element" style={{ height: "10vh" }}></div>
    </>
  )
}

const ConfirmRetry = ({ setRetry }) => (
  <div style={{ textAlign: 'center' }}>
    <h2>Skip verification?</h2>
    <p>We noticed you have verified yourself already.</p>
    <p>Would you like to skip to the Store step?</p>
    <div style={{ display: 'flex', flex: 'flex-row', marginTop: '20px' }}>
      <button
        className="export-private-info-button"
        style={{
          lineHeight: "1",
          fontSize: "16px"
        }}
        onClick={() => setRetry(false)}
      >
        No, I want to verify again
      </button>
      <div style={{ margin: '10px' }}></div>
      <button
        className="x-button"
        style={{
          lineHeight: "1",
          fontSize: "16px"
        }}
        onClick={() => {
          // TODO: Change URL when we migrate to Veriff
          const retrievalEndpoint = `${idServerUrl}/v2/registerVouched/vouchedCredentials?jobID=${localStorage.getItem('jobID')}`
          const encodedRetrievalEndpoint = encodeURIComponent(window.btoa(retrievalEndpoint))
          window.location.href=(`/mint/idgov/store?retrievalEndpoint=${encodedRetrievalEndpoint}`);
        }}
      >
        Yes
      </button>
    </div>
  </div>
)

function useMintGovernmentIDState() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [creds, setCreds] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [retry, setRetry] = useState(!!localStorage.getItem('jobID'));
  const [currentIdx, setCurrentIdx] = useState(0);

  // NOTE: Phone# should be removed once we switch to Veriff
  const steps = ["Phone#", "Verify", "Store", "Mint"];

  const currentStep = useMemo(() => {
    if (!phoneNumber && !store && !creds) return "Phone#";
    if (phoneNumber && !store && !creds) return "Verify";
    if (store && !creds) return "Store";
    if (creds) return "Mint";
  }, [phoneNumber, store, creds]);

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep])

  return {
    success,
    setSuccess,
    creds,
    setCreds,
    retry,
    setRetry,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
    phoneNumber,
    setPhoneNumber,
  };
}

const MintGovernmentID = () => {
  const navigate = useNavigate();
  const {
    success,
    setSuccess,
    creds,
    setCreds,
    retry,
    setRetry,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
    phoneNumber,
    setPhoneNumber,
  } = useMintGovernmentIDState();

  useEffect(() => {
    if (success && window.localStorage.getItem('register-credentialType')) {
			navigate(`/register?credentialType=${window.localStorage.getItem('register-credentialType')}&proofType=${window.localStorage.getItem('register-proofType')}&callback=${window.localStorage.getItem('register-callback')}`)
    }
  }, [success]);

  return (
    <MintContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
      ) : retry && currentStep !== "Store" && currentStep !== "Mint" ? (
        <ConfirmRetry setRetry={setRetry} />
      ) : currentStep === "Phone#" ? (
        <PhoneNumberForm onSubmit={setPhoneNumber} />
      ) : currentStep === "Verify" ? (
        <StepIDV phoneNumber={phoneNumber} />
      ) : currentStep === "Store" ? (
        <StoreCredentials onCredsStored={setCreds} />
      ) : (
        <MintButton onSuccess={() => setSuccess(true)} creds={creds} />
      )}
    </MintContainer>
  );
};

export default MintGovernmentID;
