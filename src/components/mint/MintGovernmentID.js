import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import "../../vouched-css-customization.css";
import "react-phone-number-input/style.css";
import loadVouched from "../../load-vouched";
import PhoneNumberForm from "../atoms/PhoneNumberForm";
import MintButton from "../atoms/mint-button";
import StoreCredentials from "./store-credentials";
import StepSuccess from "./StepSuccess";
import { idServerUrl, maxDailyVouchedJobCount } from "../../constants/misc";
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

function useMintGovernmentIDState() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [creds, setCreds] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
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
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
    phoneNumber,
    setPhoneNumber,
  };
}

const MintGovernmentID = () => {
  const {
    success,
    setSuccess,
    creds,
    setCreds,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
    phoneNumber,
    setPhoneNumber,
  } = useMintGovernmentIDState();

  return (
    <MintContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
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
