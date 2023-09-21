import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { parsePhoneNumber } from "react-phone-number-input";
// import "react-phone-number-input/style.css";
import "../../react-phone-number-input.css";
import PhoneNumberForm from "../../atoms/PhoneNumberForm";
import { sendCode } from "../../../utils/phone";
import { zkPhoneEndpoint } from "../../../constants";
import FinalStep from "../FinalStep/FinalStep";
import StepSuccess from "../StepSuccess";
import IssuanceContainer from "../IssuanceContainer";
import usePhoneNumberIssuanceState from "../../../hooks/usePhoneNumberIssuanceState";
import { datadogLogs } from "@datadog/browser-logs";

// Add to this when a new issuer is added
// const allowedCredTypes = ["idgov", "phone"];

const StepSuccessWithAnalytics = () => {
  useEffect(() => {
    try {
      datadogLogs.logger.info("SuccPhone", {});
      // @ts-ignore
      window.fathom.trackGoal("MAFS4E70", -0.2); //Fix cost
    } catch (err) {
      console.log(err);
    }
  }, []);
  return <StepSuccess />;
};

const VerifyPhoneNumber = () => {
  useEffect(() => {
    try {
      datadogLogs.logger.info("StartPhone", {});
      // @ts-ignore
      window.fathom.trackGoal("FVI98FRD", 0);
    } catch (err) {
      console.log(err);
    }
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
    setCode,
  } = usePhoneNumberIssuanceState();

  useEffect(() => {
    if (success && window.localStorage.getItem("register-credentialType")) {
      navigate(
        `/register?credentialType=${window.localStorage.getItem(
          "register-credentialType"
        )}&proofType=${window.localStorage.getItem(
          "register-proofType"
        )}&callback=${window.localStorage.getItem("register-callback")}`
      );
    }
  }, [success, navigate]);

  useEffect(() => {
    if (!phoneNumber) return;
    datadogLogs.logger.info("SendPhoneCode", {});
    sendCode(phoneNumber);
  }, [phoneNumber]);

  const onChange = (event: any) => {
    const newCode = event.target.value;
    setCode(newCode);
    if (newCode.length === 6) {
      const country = parsePhoneNumber(phoneNumber!)?.country;
      const retrievalEndpoint = `${zkPhoneEndpoint}/getCredentials/v3/${phoneNumber}/${newCode}/${country}`;
      const encodedRetrievalEndpoint = encodeURIComponent(
        window.btoa(retrievalEndpoint)
      );
      datadogLogs.logger.info("EnterPhoneCode", {});
      navigate(
        `/issuance/phone/store?retrievalEndpoint=${encodedRetrievalEndpoint}`
      );
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
          <input value={code} onChange={onChange} className="text-field" />
        </>
      ) : (
        // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </IssuanceContainer>
  );
};

export default VerifyPhoneNumber;
