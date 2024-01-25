import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { zkPhoneEndpoint } from "../constants";
import usePhoneServerSessions from "./usePhoneServerSessions";

const steps = ["Pay", "Phone#", "Verify", "Finalize"];

function usePhoneNumberIssuanceState() {
  const { store } = useParams();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");
  const [success, setSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [code, setCode] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);

  const {
    data: phoneServerSessions,
    isLoading: phoneServerSessionsIsLoading,
    refetch: refetchPhoneServerSessions
  } = usePhoneServerSessions(sid ?? undefined);

  const currentStep = useMemo(() => {
    if (sid && (phoneServerSessions?.[0]?.sessionStatus?.S === "NEEDS_PAYMENT")) return "Pay";
    if (!phoneNumber && !store) return "Phone#";
    if (phoneNumber && !store) return "Verify";
    else return "Finalize";
  }, [phoneNumber, store, phoneServerSessions]);

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep]);

  const {
    data: paymentResponse,
    isLoading: paymentSubmissionIsLoading,
    isError: paymentSubmissionIsError,
    error: phonePaymentError,
    mutate: submitPhonePayment
  } = useMutation(
    async (data: { chainId?: number, txHash?: string, orderId?: string }) => {
      if (!sid) throw new Error("No session ID");
      // if (!data?.orderId && !data?.chainId) throw new Error("No chain ID");
      // if (!data?.orderId && !data?.txHash) throw new Error("No transaction hash");
      // if (!data?.orderId) throw new Error("No orderId");

      const resp = await fetch(`${zkPhoneEndpoint}/sessions/${sid}/payment/v2`, {
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
        refetchPhoneServerSessions();
      },
      onError: (err) => {
        console.error(err)
        if ((err as any)?.message) {
          alert(`Error submitting payment: ${(err as any).message}`)
        }
      }
    }
  )

  const phonePaymentErrorMsg = useMemo(() => {
    if (!paymentSubmissionIsError) return null;
    try {
      const msg = (phonePaymentError as any)?.message

      if (msg) {
        return msg
      }
      return null;  
    } catch (err) {
      return 'Unknown payment error'
    }
  }, [paymentSubmissionIsError, phonePaymentError])

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
    paymentResponse,
    paymentSubmissionIsLoading,
    paymentSubmissionIsError,
    phonePaymentErrorMsg,
    submitPhonePayment,
  };
}

export default usePhoneNumberIssuanceState;
