import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import PhoneNumberForm from "../atoms/PhoneNumberForm";
import { sendCode } from "../../utils/phone";
import { zkPhoneEndpoint } from "../../constants/misc";
import MintButton from "./mint-button";
import StoreCredentials from "./store-credentials";
import StepSuccess from "./StepSuccess";
import MintContainer from "./MintContainer";

// Add to this when a new issuer is added
const allowedCredTypes = ["idgov", "phone"];

function useMintPhoneNumberState() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [creds, setCreds] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [code, setCode] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);

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
    code,
    setCode,
  };
}

const MintPhoneNumber = () => {
  const navigate = useNavigate();
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
    code,
    setCode
  } = useMintPhoneNumberState();

  useEffect(() => {
    if (!phoneNumber) return;
    console.log("sending code to ", phoneNumber);
    sendCode(phoneNumber);
  }, [phoneNumber]);

  const onChange = (event) => {
    const newCode = event.target.value;
    setCode(newCode);
    if (newCode.length === 6) {
      const country = parsePhoneNumber(phoneNumber).country;
      const retrievalEndpoint = `${zkPhoneEndpoint}/getCredentials/${phoneNumber}/${newCode}/${country}`
      const encodedRetrievalEndpoint = encodeURIComponent(window.btoa(retrievalEndpoint));
      navigate(`/mint/phone/store?retrievalEndpoint=${encodedRetrievalEndpoint}`);
    }
  };

  return (
    <MintContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
      ) : currentStep === "Phone#" ? (
        <PhoneNumberForm onSubmit={setPhoneNumber} />
      ) : currentStep === "Verify" ? (
        <>
          <h2 style={{ marginBottom: "25px" }}>Enter the code texted to you</h2>
          <input
            value={code}
            onChange={onChange}
            className="text-field"
          ></input>
        </>
      ) : currentStep === "Store" ? (
        <StoreCredentials onCredsStored={setCreds} />
      ) : (
        <MintButton onSuccess={() => setSuccess(true)} creds={creds} />
      )}
    </MintContainer>
  );
};

export default MintPhoneNumber;
