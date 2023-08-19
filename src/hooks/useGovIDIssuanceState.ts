import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

const steps = ["Verify", "Finalize"];

function useGovernmentIDIssuanceState() {
  const { store } = useParams();
  const [success, setSuccess] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentStep = useMemo(() => {
    if (!store) return "Verify";
    else return "Finalize";
  }, [store]);

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
  };
}

export default useGovernmentIDIssuanceState;
