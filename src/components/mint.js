import { useState, useEffect } from "react";
import loadVouched from "../load-vouched";
import { useAccount } from "wagmi";
import { useParams } from "react-router-dom";
import StoreCredentials from "./store-credentials";
import MintButton from "./atoms/mint-button";
import Progress from "./atoms/progress-bar";
import ConnectWallet from "./atoms/ConnectWallet";
import { WithCheckMark } from "./atoms/checkmark";
import "../vouched-css-customization.css";
import RoundedWindow from "./RoundedWindow";
import { getExtensionState } from "../utils/extension-helpers";
import "react-phone-number-input/style.css";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import { zkPhoneEndpoint } from "../constants/misc";
import axios from "axios";
// import { Success } from "./components/success";

// TODO: refactor phone number and gov id to different files
const sendCode = (phoneNumber) => {
  axios.get(zkPhoneEndpoint + "/send/" + phoneNumber);
}

const getCredentialsPhone = (phoneNumber, code, country, callback) => {
  console.log(`${zkPhoneEndpoint}/getCredentials/${phoneNumber}/${code}/${country}`);
  axios.get(`${zkPhoneEndpoint}/getCredentials/${phoneNumber}/${code}/${country}`)
  .then((response) => callback(response.data));
}
const Step1 = () => (
  <>
    <ConnectWallet />
    <h1>Please Connect Your Wallet First</h1>
    <h3>If you do not have a browser wallet, please install one, such as <a href="https://metamask.io/" target="_blank" rel="noreferrer">MetaMask</a></h3>
  </>
);

const Step1Pt1 = ({onComplete}) => (
  <>
    <h1>Set up the Holonym Extension</h1>
      <h2>Please open the extension and set a password</h2>
      <a className="x-button secondary" onClick={onComplete}>Done</a>
  </>
)

const Step2 = (props) => {
  const [phone, setPhone] = useState();
  return <>
    <h1 style={{"marginBottom":"25px"}}>Verify your real number</h1>
    <p style={{"marginBottom":"25px"}}>Please enter your personal phone (burner won't work)</p>
    <PhoneInput
      placeholder="Enter phone number"
      defaultCountry="US"
      value={phone}
      onChange={setPhone}/>
      <div className="spacer-medium"></div>
      <button className="x-button secondary outline" onClick={()=>props.onSubmit(phone)}>next</button>
  </>
}

// Step 2A happens when user is using phone with crosscheck for government ID
const Step2A = ({phoneNumber}) => {
  useEffect(()=>loadVouched(phoneNumber), []);
  return <>
    <h1 style={{"marginBottom":"25px"}}>Verify your ID</h1>
    <div id="vouched-element" style={{ height: "10vh"}}></div>
  </>
}

// Step 2B happens when user is using phone by itself, needing 2FA
const Step2B = ({phoneNumber, callback}) => {
  sendCode(phoneNumber);
  console.log(phoneNumber);
  const [code, setCode] = useState("");
  const onChange = (e) => {
    const newCode = e.target.value
    setCode(newCode);
    if(newCode.length === 6){
      getCredentialsPhone(
        phoneNumber, 
        newCode, 
        parsePhoneNumber(phoneNumber).country, 
        callback
      );
    }
  }
  return <>
    <h1 style={{"marginBottom":"25px"}}>Enter the code texted to you</h1>
    <input value={code} onChange={onChange} className="text-field"></input>
  </>
}

const Step2Pt1 = (props) => true ? <Step2B {...props} /> : <Step2A {...props} />

const Step3 = (props) => {
  return <>
    <h1>Store Credentials</h1>
    {<StoreCredentials {...props} />}
  </>
}

// const Step3 = (props) => <MintButton {...props} />

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

const allowedCredTypes = ["idgov", "phone"];


const Mint = (props) => {
  const { credType, jobID } = useParams();
  const [es, setES] = useState(); // TODO: this should not be isRegistered but rather hasCredentials!!!
  const [success, setSuccess] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [creds, setCreds] = useState();
  const { data: account } = useAccount();

  let current = 1;
  const isInstalled = Boolean(window.holonym);
  if(isInstalled && !es?.hasPassword) current = 1.1; // TODO: this should not be isRegistered but rather hasCredentials!!!
  if(isInstalled && es?.hasPassword) current = 2;
  if(isInstalled && phoneNumber) current = 2.1;
  if(isInstalled && jobID) current = 3;
  if(isInstalled && creds) current = 4;
  if(isInstalled && props.retry) current = -1; // If there was an issue and the user wants to retry minting using credentials from extension
  console.log("Current", current)
  if(success) current = null;
    
  if (!(allowedCredTypes.includes(credType))) { return }

  return <RoundedWindow>
    {/* <div style={{display: "flex", alignItems : "center", justifyContent : "center"}}><h2>Mint a Holo</h2></div> */}
    <div className="spacer-medium" />
    <Progress steps={["Download", "Verify", "Store", "Mint"] } currentIdx={current-1} />
    <div style={{position: "relative", paddingTop: "100px", width:"100%", height: "90%",/*width:"60vw", height: "70vh",*/ display: "flex", alignItems: "center", justifyContent: "start", flexDirection: "column"}}>
      {(current === 1) && <Step1 />}
      {(current === 1.1) && <Step1Pt1 onComplete={async ()=> {let es = await getExtensionState(); console.log(es); setES(es); if(!es?.hasPassword)alert("no you're not done!")}} />}
      {(current === 2) && <Step2 onSubmit={setPhoneNumber} />}
      {(current === 2.1) && <Step2Pt1 phoneNumber={phoneNumber} callback={setCreds} />}
      {(current === 3) && <Step3 onSetCredsFromExtension={setCreds} credsType={credType} />}
      {/* {(current === 4) && <Step4 onSuccess={()=>setSuccess(true)} creds={creds} />} */}
      {(current === -1) && <Step3 onSetCredsFromExtension={setCreds} jobID="loadFromExtension" />}
      {success && <Success />}
    </div>
  </RoundedWindow>
}
export default Mint;