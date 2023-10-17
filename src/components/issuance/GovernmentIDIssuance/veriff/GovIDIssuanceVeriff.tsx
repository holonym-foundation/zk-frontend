import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StepIDVVeriff from "./StepIDVVeriff";
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
    idvSessionMetadataErrorMsg,
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
      ) : currentStep === "Pay" && !idvSessionMetadataIsLoading && !idvSessionMetadataErrorMsg ? (
        <GovIDPayment onPaymentSuccess={createIdvSession} />
      ) : currentStep === "Pay" && idvSessionMetadataIsLoading && !idvSessionMetadataErrorMsg ? (
        <div>
          <p>Loading...</p>
        </div>
      ) : currentStep === "Pay" && idvSessionMetadataErrorMsg ? (
        <div>
          <p style={{ color: 'red' }}>Error: {idvSessionMetadataErrorMsg}</p>
          <p style={{ color: 'red' }}>sid: {sid}</p>
        </div>
      ) : currentStep === "Verify" ? (
        <StepIDVVeriff 
          url={idvSessionMetadata?.url ?? idServerSessions?.[0].veriffUrl}
          sessionId={idvSessionMetadata?.id ?? idServerSessions?.[0].sessionId} 
        />
      ) : (
        // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </VerificationContainer>
  );
};

export default GovernmentIDIssuance;
