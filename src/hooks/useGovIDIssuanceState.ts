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
    error: idvSessionMetadataError,
    mutate: createIdvSession
  } = useMutation(
    async (data: { chainId?: number, txHash?: string, orderId?: string }) => {
      if (!sid) throw new Error("No session ID");
      // if (!data?.orderId && !data?.chainId) throw new Error("No chain ID");
      // if (!data?.orderId && !data?.txHash) throw new Error("No transaction hash");
      // if (!data?.orderId) throw new Error("No orderId");

      const resp = await fetch(`${idServerUrl}/sessions/${sid}/idv-session/v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sid,
          chainId: data.chainId,
          txHash: data.txHash,
          orderId: data.orderId,
        }),
      })

      if (!resp.ok) {
        throw new Error((await resp.json()).error)
      }

      return resp.json()
    },
    {
      onSuccess: () => {
        refetchIdServerSessions();
      }
    }
  )

  const idvSessionMetadataErrorMsg = useMemo(() => {
    if (!idvSessionMetadataIsError) return null;
    try {
      const msg = (idvSessionMetadataError as any)?.message

      if (msg) {
        return msg
      }
      return null;  
    } catch (err) {
      return 'Unknown payment error'
    }
  }, [idvSessionMetadataIsError, idvSessionMetadataError])

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
    idvSessionMetadataErrorMsg,
    createIdvSession
  };
}

export default useGovernmentIDIssuanceState;
