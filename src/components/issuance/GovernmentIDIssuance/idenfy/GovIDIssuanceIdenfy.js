import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import StepIDVIdenfy from "./StepIDVIdenfy";
import FinalStep from "../../FinalStep";
import VerificationContainer from "../../IssuanceContainer";
import StepSuccessWithAnalytics from '../StepSuccessWithAnalytics'
import useGovernmentIDIssuanceState from '../../../../hooks/useGovIDIssuanceState'

const GovernmentIDIssuance = () => {
  const navigate = useNavigate();
  const {
    success,
    setSuccess,
    currentIdx,
    steps,
    currentStep,
  } = useGovernmentIDIssuanceState();

  useEffect(() => {
    if (success && window.localStorage.getItem('register-credentialType')) {
			navigate(`/register?credentialType=${window.localStorage.getItem('register-credentialType')}&proofType=${window.localStorage.getItem('register-proofType')}&callback=${window.localStorage.getItem('register-callback')}`)
    }
  }, [navigate, success]);

  return (
    <VerificationContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccessWithAnalytics />
      ) : currentStep === "Verify" ? (
        <StepIDVIdenfy />
      ) : ( // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </VerificationContainer>
  );
};

export default GovernmentIDIssuance;
