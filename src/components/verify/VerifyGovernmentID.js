import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../vouched-css-customization.css";
import "react-phone-number-input/style.css";
import loadVouched from "../../load-vouched";
import PhoneNumberForm from "../atoms/PhoneNumberForm";
import FinalStep from "./FinalStep";
import StepSuccess from "./StepSuccess";
import { idServerUrl, maxDailyVouchedJobCount } from "../../constants";
import VerificationContainer from "./VerificationContainer";

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
          window.location.href=(`/verify/idgov/store?retrievalEndpoint=${encodedRetrievalEndpoint}`);
        }}
      >
        Yes
      </button>
    </div>
  </div>
)

function useVerifyGovernmentIDState() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  // TODO: Check sessionId once we switch to Veriff
  const [retry, setRetry] = useState(!!localStorage.getItem('jobID'));
  const [currentIdx, setCurrentIdx] = useState(0);

  // NOTE: Phone# should be removed once we switch to Veriff
  const steps = ["Phone#", "Verify", "Finalize"];

  const currentStep = useMemo(() => {
    if (!phoneNumber && !store) return "Phone#";
    if (phoneNumber && !store) return "Verify";
    if (store) return "Finalize";
  }, [phoneNumber, store]);

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep])

  return {
    success,
    setSuccess,
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

const VerifyGovernmentID = () => {
  const navigate = useNavigate();
  const {
    success,
    setSuccess,
    retry,
    setRetry,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
    phoneNumber,
    setPhoneNumber,
  } = useVerifyGovernmentIDState();

  useEffect(() => {
    if (success && window.localStorage.getItem('register-credentialType')) {
			navigate(`/register?credentialType=${window.localStorage.getItem('register-credentialType')}&proofType=${window.localStorage.getItem('register-proofType')}&callback=${window.localStorage.getItem('register-callback')}`)
    }
  }, [success]);

  return (
    <VerificationContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
      ) : retry && currentStep !== "Finalize" ? (
        <ConfirmRetry setRetry={setRetry} />
      ) : currentStep === "Phone#" ? (
        <PhoneNumberForm onSubmit={setPhoneNumber} />
      ) : currentStep === "Verify" ? (
        <StepIDV phoneNumber={phoneNumber} />
      ) : ( // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </VerificationContainer>
  );
};

export default VerifyGovernmentID;
