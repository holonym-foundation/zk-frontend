import React, { useState } from "react";
import PhoneInput from "react-phone-number-input";

const PhoneNumberForm = ({ onSubmit }) => {
  const [phone, setPhone] = useState();

  return (
    <>
      <h2 style={{ marginBottom: "25px", marginTop: "-25px" }}>
        Verify your real number
      </h2>
      <p style={{ marginBottom: "25px" }}>
        Please enter your personal phone (burner won't work)
      </p>
      <PhoneInput
        placeholder="Enter phone number"
        defaultCountry="US"
        value={phone}
        onChange={setPhone}
      />
      <div className="spacer-medium" />
      <button
        className="x-button secondary outline"
        onClick={() => onSubmit(phone)}
      >
        next
      </button>
    </>
  );
};

export default PhoneNumberForm;
