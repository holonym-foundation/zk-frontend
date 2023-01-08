import { useState, useEffect, useMemo } from "react";
import "../../vouched-css-customization.css";
import "react-phone-number-input/style.css";
import loadVouched from "../../load-vouched";
import PhoneNumberForm from "../atoms/PhoneNumberForm";
import { idServerUrl, maxDailyVouchedJobCount } from "../../constants/misc";

const GovernmentIDVerification = ({ incrementStep }) => {
  const [phoneNumber, setPhoneNumber] = useState();

  const step = useMemo(() => {
    if (phoneNumber) {
      incrementStep();
      return "verify-id";
    }
    else return "get-phone";
  }, [phoneNumber]);

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

  return (
    <>
    {step === "get-phone" ? (
      <PhoneNumberForm onSubmit={setPhoneNumber} />
    ) : (
      <>
      <h3 style={{ marginBottom: "25px", marginTop: "-25px" }}>
        Verify your ID
      </h3>
      <div id="vouched-element" style={{ height: "10vh" }}></div>
      </>
    )}
    </>
  );
};

export default GovernmentIDVerification;
