import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { idServerUrl } from "../constants";
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

  const {
    data: idvSessionMetadata,
    isLoading: idvSessionMetadataIsLoading,
    isError: idvSessionMetadataIsError,
    mutate: createIdvSession
  } = useMutation(
    async (data: { chainId?: number, txHash?: string }) => {
      if (!sid) throw new Error("No session ID");
      if (!data?.chainId) throw new Error("No chain ID");
      if (!data?.txHash) throw new Error("No transaction hash");

      const resp = await fetch(`${idServerUrl}/sessions/${sid}/idv-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sid,
          chainId: data.chainId,
          txHash: data.txHash,
        }),
      })
      return resp.json()
    }
  )

  return {
    success,
    setSuccess,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
    idvSessionMetadata,
    idvSessionMetadataIsLoading,
    idvSessionMetadataIsError,
    createIdvSession
  };
}

export default useGovernmentIDIssuanceState;
