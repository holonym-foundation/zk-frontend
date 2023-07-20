import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parsePhoneNumber } from "react-phone-number-input";
// import "react-phone-number-input/style.css";
import "../../react-phone-number-input.css";
import PhoneNumberForm from "../atoms/PhoneNumberForm";
import { sendCode } from "../../utils/phone";
import { zkPhoneEndpoint } from "../../constants";
import FinalStep from "./FinalStep";
import StepSuccess from "./StepSuccess";
import IssuanceContainer from "./IssuanceContainer";
import { datadogLogs } from "@datadog/browser-logs";

// Add to this when a new issuer is added
// const allowedCredTypes = ["idgov", "phone"];

const steps = ["Phone#", "Verify", "Finalize"];

const StepSuccessWithAnalytics = () => {
  useEffect(() => {
    datadogLogs.logger.info("SuccPhone", {});
    window.fathom.trackGoal('MAFS4E70', -.20); //Fix cost
  }, []);
  return <StepSuccess />
}


function useVerifyPhoneNumberState() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [code, setCode] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);


  const currentStep = useMemo(() => {
    if (!(phoneNumber || store)) return "Phone#";
    if (phoneNumber && !store) return "Verify";
    if (store) return "Finalize";
  }, [phoneNumber, store]);

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep])

  return {
    success,
    setSuccess,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
    phoneNumber,
    setPhoneNumber,
    code,
    setCode,
  };
}

const VerifyPhoneNumber = () => {
  useEffect(() => {
    datadogLogs.logger.info("StartPhone", {});
    window.fathom.trackGoal('FVI98FRD', 0)
  }, []);

  const navigate = useNavigate();
  const {
    success,
    setSuccess,
    currentIdx,
    steps,
    currentStep,
    phoneNumber,
    setPhoneNumber,
    code,
    setCode
  } = useVerifyPhoneNumberState();

  useEffect(() => {
    if (success && window.localStorage.getItem('register-credentialType')) {
			navigate(`/register?credentialType=${window.localStorage.getItem('register-credentialType')}&proofType=${window.localStorage.getItem('register-proofType')}&callback=${window.localStorage.getItem('register-callback')}`)
    }
  }, [success, navigate]);
  
  useEffect(() => {
    if (!phoneNumber) return;
    datadogLogs.logger.info("SendPhoneCode", {});
    sendCode(phoneNumber);
  }, [phoneNumber]);

  const onChange = (event) => {
    const newCode = event.target.value;
    setCode(newCode);
    if (newCode.length === 6) {
      const country = parsePhoneNumber(phoneNumber).country;
      const retrievalEndpoint = `${zkPhoneEndpoint}/getCredentials/v2/${phoneNumber}/${newCode}/${country}`
      const encodedRetrievalEndpoint = encodeURIComponent(window.btoa(retrievalEndpoint));
      datadogLogs.logger.info("EnterPhoneCode", {});
      navigate(`/issuance/phone/store?retrievalEndpoint=${encodedRetrievalEndpoint}`);
    }
  };

  return (
    <IssuanceContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccessWithAnalytics />
      ) : currentStep === "Phone#" ? (
        <PhoneNumberForm onSubmit={setPhoneNumber} />
      ) : currentStep === "Verify" ? (
        <>
          <h2 style={{ marginBottom: "25px" }}>Enter the code texted to you</h2>
          <input
            value={code}
            onChange={onChange}
            className="text-field"
          />
        </>
      ) : ( // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </IssuanceContainer>
  );
};

export default VerifyPhoneNumber;
