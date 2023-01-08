import { useState, useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import { useParams } from "react-router-dom";
import StoreCredentials from "./store-credentials";
import MintButton from "./atoms/mint-button";
import Progress from "./atoms/progress-bar";
import { WithCheckMark } from "./atoms/checkmark";
import "../vouched-css-customization.css";
import RoundedWindow from "./RoundedWindow";
import "react-phone-number-input/style.css";
import ConnectWalletScreen from "./atoms/connect-wallet-screen";
import PhoneNumberVerification from "./verifications/PhoneNumberVerification";
import GovernmentIDVerification from "./verifications/GovernmentIDVerification";


const StepSuccess = () => {
  const toTweet = `Just tried out the Holonym beta version and minted my Holo: https://app.holonym.id/mint Each mint makes on-chain privacy stronger ⛓🎭`;
  return (
    <>
      <WithCheckMark size={3}>
        <h2>Success</h2>
      </WithCheckMark>
      <h5>
        By minting a Holo, you not only created an identity but also made the
        Privacy Pool (anonymity set) larger
      </h5>
      <br />
      <p>
        <a
          href="https://docs.holonym.id"
          target="_blank"
          style={{ color: "#2fd87a", textDecoration: "underline #2fd87a" }}
        >
          Learn about the privacy tech
        </a>
      </p>
      <p>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            toTweet
          )}`}
          target="_blank"
          style={{ color: "#2fd87a", textDecoration: "underline #2fd87a" }}
        >
          Bring more privacy to the web: Share your privacy pool contribution
        </a>
      </p>
      {/* <button className="x-button outline">Learn More</button> */}
      {/* <p>Or <a href="https://holonym.id/whitepaper.pdf" target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>learn more</a></p> */}
    </>
  );
};

// Add to this when a new issuer is added
const allowedCredTypes = ["idgov", "phone"];


function useMintState() {
  const { credType, store } = useParams();
  const [success, setSuccess] = useState();
  const [creds, setCreds] = useState();
  const [currentIdx, setCurrentIdx] = useState(0);
  const incrementCurrentIdx = () => setCurrentIdx(currentIdx + 1);
  const { data: account } = useAccount();

  const steps = useMemo(() => {
    if (credType === "idgov") {
      // NOTE: Phone# should be removed once we switch to Veriff
      return ["Phone#", "Verify", "Store", "Mint"];
    } else if (credType === "phone") {
      return ["Phone#", "Verify", "Store", "Mint"];
    } else if (allowedCredTypes.includes(credType)) {
      // In case an issuer is sending a user here just to store & mint
      return ["Store", "Mint"]
    }
  }, [credType]);

  const currentStep = useMemo(() => steps[currentIdx], [steps, currentIdx]);

  useEffect(() => {
    if (credType && store) setCurrentIdx(steps.length - 2)
  }, [credType, store])

  return {
    success,
    setSuccess,
    creds,
    setCreds,
    currentIdx,
    setCurrentIdx,
    incrementCurrentIdx,
    steps,
    currentStep,
    account,
    credType,
    store,
  };
}


const Mint = (props) => {
  const {
    success,
    setSuccess,
    creds,
    setCreds,
    currentIdx,
    setCurrentIdx,
    incrementCurrentIdx,
    steps,
    currentStep,
    account,
    credType,
    store,
  } = useMintState();
  
  return (
    <RoundedWindow>
      {!account ? (
        <ConnectWalletScreen />
      ) : (
        <>
          <div className="spacer-medium" />
          <Progress steps={steps} currentIdx={currentIdx} />
          <div
            style={{
              position: "relative",
              paddingTop: "100px",
              width: "100%",
              height: "90%",
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
              flexDirection: "column",
            }}
          >
            {currentStep === "Store" ? (
              <StoreCredentials 
                onCredsStored={(credsTemp) => {
                  setCreds(credsTemp);
                  setCurrentIdx(steps.length - 1);
                }}
              />
            ) : currentStep === "Mint" ? (
              <MintButton onSuccess={() => setSuccess(true)} creds={creds} />
            ) : credType === "idgov" ? (
              <GovernmentIDVerification incrementStep={incrementCurrentIdx} />
            ) : credType === "phone" ? (
              <PhoneNumberVerification incrementStep={incrementCurrentIdx} />
            ) : (
              <></>
            )}
            {success && <StepSuccess />}
          </div>
        </>
      )}
    </RoundedWindow>
  );
};

export default Mint;
