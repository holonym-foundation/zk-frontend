import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "react-phone-number-input/style.css";
import { createVeriffFrame, MESSAGES } from '@veriff/incontext-sdk';
import { useQuery } from '@tanstack/react-query'
import PhoneNumberForm from "../atoms/PhoneNumberForm";
import MintButton from "../atoms/mint-button";
import StoreCredentials from "./store-credentials";
import StepSuccess from "./StepSuccess";
import { idServerUrl, maxDailyVouchedJobCount } from "../../constants/misc";
import MintContainer from "./MintContainer";

// Add to this when a new issuer is added
const allowedCredTypes = ["idgov", "phone"];

const StepIDV = ({ phoneNumber }) => {
  const navigate = useNavigate();
  const veriffSessionQuery = useQuery({
    queryKey: ['veriffSession'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/veriff/session`, {
        method: "POST",
      })
      return await resp.json()
    } 
  });

  useEffect(() => {
    if (!phoneNumber || !veriffSessionQuery.data?.url) return;
    
    const verification = veriffSessionQuery.data;
    const handleVeriffEvent = (msg) => {
      if (msg === MESSAGES.FINISHED) {
        const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${verification.id}`
        const encodedRetrievalEndpoint = encodeURIComponent(window.btoa(retrievalEndpoint))
        navigate(`/mint/idgov/store?retrievalEndpoint=${encodedRetrievalEndpoint}`)
      }
    }
    createVeriffFrame({
      url: verification.url,
      onEvent: handleVeriffEvent
    });
  }, [veriffSessionQuery])

  // Old code for vouched. Should probably implement similar "maxJobCount" check for Veriff
  // useEffect(() => {
  //   (async () => {
  //     const resp = await fetch(`${idServerUrl}/vouched/job-count`)
  //     const data = await resp.json();
  //     if (data.jobCount >= maxVouchedJobCount) {
  //       alert("Sorry, we cannot verify any more IDs at this time");
  //       return;
  //     }
  //     loadVouched(phoneNumber);
  //   })();
  // }, []);

  if (!phoneNumber) {
    return <p>No phone number specified</p>
  }
  return (
    <>
      <h3 style={{marginBottom:"25px", marginTop: "-25px"}}>Verify your ID</h3>
    </>
  );
}

function useMintGovernmentIDState() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [creds, setCreds] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [currentIdx, setCurrentIdx] = useState(0);

  // NOTE: Phone# should be removed once we switch to Veriff
  const steps = ["Phone#", "Verify", "Store", "Mint"];

  // const currentStep = useMemo(() => steps[currentIdx], [steps, currentIdx]);
  const currentStep = useMemo(() => {
    if (!phoneNumber && !store && !creds) return "Phone#";
    if (phoneNumber && !store && !creds) return "Verify";
    if (store && !creds) return "Store";
    if (creds) return "Mint";
  }, [phoneNumber, store, creds]);

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
    phoneNumber,
    setPhoneNumber,
  };
}

const MintGovernmentID = () => {
  const {
    success,
    setSuccess,
    creds,
    setCreds,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
    phoneNumber,
    setPhoneNumber,
  } = useMintGovernmentIDState();

  return (
    <MintContainer steps={steps} currentIdx={currentIdx}>
      {success ? (
        <StepSuccess />
      ) : currentStep === "Phone#" ? (
        <PhoneNumberForm onSubmit={setPhoneNumber} />
      ) : currentStep === "Verify" ? (
        <StepIDV phoneNumber={phoneNumber} />
      ) : currentStep === "Store" ? (
        <StoreCredentials onCredsStored={setCreds} />
      ) : (
        <MintButton onSuccess={() => setSuccess(true)} creds={creds} />
      )}
    </MintContainer>
  );
};

export default MintGovernmentID;
