import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StepIDVOnfido from "./StepIDVOnfido";
import FinalStep from "../../FinalStep/FinalStep";
import VerificationContainer from "../../IssuanceContainer";
import StepSuccessWithAnalytics from "../StepSuccessWithAnalytics";
import GovIDPayment from "../GovIDPayment";
import useGovernmentIDIssuanceState from "../../../../hooks/useGovIDIssuanceState";
import useIdServerSessions from "../../../../hooks/useIdServerSessions";

const GovernmentIDIssuance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");

  const {
    data: idServerSessions,
  } = useIdServerSessions(sid ?? undefined);

  const {
    success,
    setSuccess,
    currentIdx,
    steps,
    currentStep,
    idvSessionMetadata,
    idvSessionMetadataIsLoading,
    idvSessionMetadataIsError,
    createIdvSession
  } = useGovernmentIDIssuanceState();

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
      ) : currentStep === "Pay" && !idvSessionMetadataIsLoading ? (
        <GovIDPayment onPaymentSuccess={createIdvSession} />
      ) : currentStep === "Pay" && idvSessionMetadataIsLoading ? (
        <div>
          <p>Loading...</p>
        </div>
      ) : currentStep === "Verify" ? (
        <StepIDVOnfido 
          sdk_token={idvSessionMetadata?.sdk_token ?? idServerSessions?.[0].onfido_sdk_token} 
        />
      ) : (
        // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </VerificationContainer>
  );
};

export default GovernmentIDIssuance;
