/**
 * Component for minting credentials from external issuers.
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FinalStep from "./FinalStep";
import StepSuccess from "./StepSuccess";
import MintContainer from "./MintContainer";

function useMintExternalState() {
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

const MintExternal = () => {
  const {
    success,
    setSuccess,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
  } = useMintExternalState();

  return (
    <MintContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
      ) : (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </MintContainer>
  );
};

export default MintExternal;
