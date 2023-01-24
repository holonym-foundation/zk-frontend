/**
 * Component for minting credentials from external issuers.
 */
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import MintButton from "./mint-button";
import StoreCredentials from "./store-credentials";
import StepSuccess from "./StepSuccess";
import MintContainer from "./MintContainer";

function useMintExternalState() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [creds, setCreds] = useState();
  const [currentIdx, setCurrentIdx] = useState(0);

  const steps = ["Store", "Mint"];

  const currentStep = useMemo(() => {
    if (store && !creds) return "Store";
    if (creds) return "Mint";
  }, [store, creds]);

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep])

  return {
    success,
    setSuccess,
    creds,
    setCreds,
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
    creds,
    setCreds,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
  } = useMintExternalState();

  return (
    <MintContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
      ) : currentStep === "Store" ? (
        <StoreCredentials onCredsStored={setCreds} />
      ) : (
        <MintButton onSuccess={() => setSuccess(true)} creds={creds} />
      )}
    </MintContainer>
  );
};

export default MintExternal;
