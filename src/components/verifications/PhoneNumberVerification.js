import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parsePhoneNumber } from "react-phone-number-input";
import PhoneNumberForm from "../atoms/PhoneNumberForm";
import { sendCode } from "../../utils/phone";
import { zkPhoneEndpoint } from "../../constants/misc";

// incrementStep should be called after a step is completed. It increments the step counter.
// Incrementing steps rather than specifying each step allows verification components to have
// an arbitrary number of steps.
const PhoneNumberVerification = ({ incrementStep }) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState();
  const [code, setCode] = useState("");

  const step = useMemo(() => {
    if (phoneNumber) {
      incrementStep();
      return "2fa";
    }
    else return "get-phone";
  }, [phoneNumber]);

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
      const retrievalEndpoint = `${zkPhoneEndpoint}/getCredentials/${phoneNumber}/${code}/${country}`;
      navigate(`/mint/phone/store?retrievalEndpoint=${retrievalEndpoint}`);
    }
  };

  return (
    <>
      {step === "get-phone" ? (
        <PhoneNumberForm onSubmit={setPhoneNumber} />
      ) : (
        <>
          <h2 style={{ marginBottom: "25px" }}>Enter the code texted to you</h2>
          <input
            value={code}
            onChange={onChange}
            className="text-field"
          ></input>
        </>
      )}
    </>
  );
};

export default PhoneNumberVerification;
