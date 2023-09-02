import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import useIdServerSessions from "./useIdServerSessions";

const steps = ["Pay", "Verify", "Finalize"];

function useGovernmentIDIssuanceState() {
  const { store } = useParams();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");
  const [success, setSuccess] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const {
    data: idServerSessions,
    isLoading: idServerSessionsIsLoading,
    refetch: refetchIdServerSessions
  } = useIdServerSessions(sid ?? undefined);

  const currentStep = useMemo(() => {
    if (sid && (idServerSessions?.[0]?.status === "NEEDS_PAYMENT")) return "Pay";
    if (!store) return "Verify";
    else return "Finalize";
  }, [idServerSessions, store]);

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
