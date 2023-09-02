import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { idServerUrl } from "../../../../constants";
import StepIDVVeriff from "./StepIDVVeriff";
import FinalStep from "../../FinalStep";
import VerificationContainer from "../../IssuanceContainer";
import StepSuccessWithAnalytics from "../StepSuccessWithAnalytics";
import GovIDPayment from "../GovIDPayment";
import useGovernmentIDIssuanceState from "../../../../hooks/useGovIDIssuanceState";

const GovernmentIDIssuance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");

  const {
    success,
    setSuccess,
    currentIdx,
    steps,
    currentStep
  } = useGovernmentIDIssuanceState();

  const {
    data: idvSessionMetadata,
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

  useEffect(() => {
    if (success && window.localStorage.getItem("register-credentialType")) {
      navigate(
        `/register?credentialType=${window.localStorage.getItem(
          "register-credentialType"
        )}&proofType=${window.localStorage.getItem(
          "register-proofType"
        )}&callback=${window.localStorage.getItem("register-callback")}`
      );
    }
  }, [navigate, success]);

  return (
    <VerificationContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccessWithAnalytics />
      ) : currentStep === "Pay" ? (
        <GovIDPayment onPaymentSuccess={createIdvSession} />
      ) : currentStep === "Verify" ? (
        <StepIDVVeriff url={idvSessionMetadata?.url} sessionId={idvSessionMetadata?.id} />
      ) : (
        // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </VerificationContainer>
  );
};

export default GovernmentIDIssuance;
