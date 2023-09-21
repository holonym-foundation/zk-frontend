import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";

const steps = ["Phone#", "Verify", "Finalize"];

function usePhoneNumberIssuanceState() {
  const { store } = useParams();
  const [success, setSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [code, setCode] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentStep = useMemo(() => {
    if (!phoneNumber && !store) return "Phone#";
    if (phoneNumber && !store) return "Verify";
    else return "Finalize";
  }, [phoneNumber, store]);

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep]);

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

export default usePhoneNumberIssuanceState;
