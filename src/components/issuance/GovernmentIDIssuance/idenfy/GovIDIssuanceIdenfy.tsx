import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepIDVIdenfy from "./StepIDVIdenfy";
import FinalStep from "../../FinalStep";
import VerificationContainer from "../../IssuanceContainer";
import StepSuccessWithAnalytics from "../StepSuccessWithAnalytics";
import GovIDPayment from "../GovIDPayment";
import useGovernmentIDIssuanceState from "../../../../hooks/useGovIDIssuanceState";

const GovernmentIDIssuance = () => {
  const navigate = useNavigate();
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
        <StepIDVIdenfy
          url={idvSessionMetadata?.url}
          scanRef={idvSessionMetadata?.scanRef}
        />
      ) : (
        // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </VerificationContainer>
  );
};

export default GovernmentIDIssuance;
