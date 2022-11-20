import { useState, useEffect } from "react";
import loadVouched from "./load-vouched";
import { useAccount } from "wagmi";
import { useParams } from "react-router-dom";
import StoreCredentials from "./components/store-credentials";
import MintButton from "./components/atoms/mint-button";
import Progress from "./components/atoms/progress-bar";
import ConnectWallet from "./components/atoms/ConnectWallet";
import { WithCheckMark } from "./components/atoms/checkmark";
import "./vouched-css-customization.css";
import RoundedWindow from "./components/RoundedWindow";
import { getExtensionState } from "./utils/extension-helpers";

// import { Success } from "./components/success";

const ConnectWalletScreen = () => (
  <>
    <ConnectWallet />
    <h1>Please Connect Your Wallet First</h1>
    <h3>If you do not have a browser wallet, please install one, such as <a href="https://metamask.io/" target="_blank" rel="noreferrer">MetaMask</a></h3>
  </>
);

const Step1 = () => {
  useEffect(loadVouched, []);
  return <>
    <h1 style={{"marginBottom":"25px"}}>Verify your ID</h1>
    <div id="vouched-element" style={{ height: "10vh"}}></div>
  </>
}

const Step2 = (props) => {
  return <>
    <h1>Store Credentials</h1>
    {<StoreCredentials {...props} />}
  </>
}

const Step3 = (props) => <MintButton {...props} />

const Success = () => {
  const toTweet = `Just tried out the Holonym beta version and minted my Holo: https://app.holonym.id/mint Each mint makes on-chain privacy stronger ⛓🎭`;
return <>
  <WithCheckMark size={3}><h1>Success</h1></WithCheckMark>
    <h4>By minting a Holo, you not only created an identity but also made the Privacy Pool (anonymity set) larger</h4>
    <br />
    <p><a href="https://holonym.id/whitepaper.pdf" target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>learn the underlying tech</a></p>
    <p><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(toTweet)}`} target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>bring more privacy to web3: tweet your privacy pool contribution!</a></p>
    {/* <button className="x-button outline">Learn More</button> */}
    {/* <p>Or <a href="https://holonym.id/whitepaper.pdf" target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>learn more</a></p> */}
</>
}
const Mint = (props) => {
  const { jobID } = useParams();
  const [success, setSuccess] = useState();
  const [creds, setCreds] = useState();
  const { data: account } = useAccount();

  let current = 1;
  if(jobID) current = 2;
  if(creds) current = 3;
  if(props.retry) current = -1; // If there was an issue submitting the minting tx and the user wants to retry
  console.log("Current", current)
  if(success) current = null;
    
  return (
    <>
      {!account?.address ? (
        <ConnectWalletScreen />
      ) : (
        <RoundedWindow>
          {/* <div style={{display: "flex", alignItems : "center", justifyContent : "center"}}><h2>Mint a Holo</h2></div> */}
          <div className="spacer-medium" />
          <Progress steps={["Verify", "Store", "Mint"] } currentIdx={current-1} />
          <div style={{position: "relative", paddingTop: "100px", width:"100%", height: "90%",/*width:"60vw", height: "70vh",*/ display: "flex", alignItems: "center", justifyContent: "start", flexDirection: "column"}}>
            {(current === 1) && <Step1 />}
            {(current === 2) && <Step2 onCredsStored={setCreds} />}
            {(current === 3) && <Step3 onSuccess={()=>setSuccess(true)} creds={creds} />}
            {(current === -1) && <Step2 onCredsStored={setCreds} jobID="retryMint" />}
            {success && <Success />}
          </div>
        </RoundedWindow>
      )}
    </>
  )
}
export default Mint;