import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { IdServerSession } from '../types'

const steps = ["Pay", "Verify", "Finalize"];

function useGovernmentIDIssuanceState({ sessionStatus }: { sessionStatus?: string }) {
  const { store } = useParams();
  const [success, setSuccess] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentStep = useMemo(() => {
    if (sessionStatus === "NEEDS_PAYMENT") return "Pay";
    if (!store) return "Verify";
    else return "Finalize";
  }, [sessionStatus, store]);

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
