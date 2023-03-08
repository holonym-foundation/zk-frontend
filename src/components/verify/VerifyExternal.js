/**
 * Component for finalizing the verification flow for credentials from external issuers.
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FinalStep from "./FinalStep";
import StepSuccess from "./StepSuccess";
import VerificationContainer from "./VerificationContainer";

function useVerifyExternalState() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [currentIdx, setCurrentIdx] = useState(0);

  const steps = ["Verify", "Finalize"];

  const currentStep = "Finalize";

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep])

  return {
    success,
    setSuccess,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
  };
}

const VerifyExternal = () => {
  const {
    success,
    setSuccess,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
  } = useVerifyExternalState();

  return (
    <VerificationContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
      ) : (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </VerificationContainer>
  );
};

export default VerifyExternal;
