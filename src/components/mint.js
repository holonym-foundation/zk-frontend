import { useState, useEffect } from "react";
import loadVouched from "../load-vouched";
import { useAccount } from "wagmi";
import { useParams } from "react-router-dom";
import StoreCredentials from "./store-credentials";
import MintButton from "./atoms/mint-button";
import Progress from "./atoms/progress-bar";
import { WithCheckMark } from "./atoms/checkmark";
import "../vouched-css-customization.css";
import RoundedWindow from "./RoundedWindow";
import "react-phone-number-input/style.css";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import { getCredentialsPhone, sendCode } from "../utils/phone";
import ConnectWalletScreen from "./atoms/connect-wallet-screen";

// import { Success } from "./components/success";


// const StepIDV = () => {
//   useEffect(loadVouched, []);
//   return <>
//     <h1 style={{"marginBottom":"25px"}}>Verify your ID</h1>
//     <div id="vouched-element" style={{ height: "10vh"}}></div>
//   </>
// }
const StepStoreCreds = (props) => {
  return <>
    {/* <h1>Store Credentials</h1> */}
    {<StoreCredentials {...props} />}
  </>
}
const StepPhoneInput = (props) => {
  const [phone, setPhone] = useState();
  return <>
    <h2 style={{marginBottom:"25px", marginTop:"-25px"}}>Verify your real number</h2>
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
const StepIDV = ({phoneNumber}) => {
  useEffect(()=>loadVouched(phoneNumber), []);
  if(!phoneNumber){return <p>No phone number specified</p>}
  return <>
    <h3 style={{marginBottom:"25px", marginTop: "-25px"}}>Verify your ID</h3>
    <div id="vouched-element" style={{ height: "10vh"}}></div>
  </>
}

// Step 2B happens when user is using phone by itself, needing 2FA
const Step2FA = ({phoneNumber, callback, errCallback}) => {
  const [code, setCode] = useState("");
  const onChange = (e) => {
    const newCode = e.target.value
    setCode(newCode);
    if(newCode.length === 6){
      getCredentialsPhone(
        phoneNumber, 
        newCode, 
        parsePhoneNumber(phoneNumber).country, 
        callback,
        errCallback
      );
    }
  }
  return <>
    <h2 style={{"marginBottom":"25px"}}>Enter the code texted to you</h2>
    <input value={code} onChange={onChange} className="text-field"></input>
  </>
}

// const Step2Pt1 = (props) => true ? <Step2B {...props} /> : <Step2A {...props} />

// const Step3 = (props) => {
//   return <>
//     <h1>Store Credentials</h1>
//     {<StoreCredentials {...props} />}
//   </>
// }

const StepMint = (props) => <MintButton {...props} />

const StepSuccess = () => {
  const toTweet = `Just tried out the Holonym beta version and minted my Holo: https://app.holonym.id/mint Each mint makes on-chain privacy stronger ⛓🎭`;
return <>
  <WithCheckMark size={3}><h2>Success</h2></WithCheckMark>
    <h5>By minting a Holo, you not only created an identity but also made the Privacy Pool (anonymity set) larger</h5>
    <br />
    <p><a href="https://docs.holonym.id" target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>Learn about the privacy tech</a></p>
    <p><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(toTweet)}`} target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>Bring more privacy to the web: Share your privacy pool contribution</a></p>
    {/* <button className="x-button outline">Learn More</button> */}
    {/* <p>Or <a href="https://holonym.id/whitepaper.pdf" target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>learn more</a></p> */}
</>
}

const allowedCredTypes = ["idgov", "phone"];


const Mint = (props) => {
  const { credType, storing } = useParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [readyToMint , setReadyToMint] = useState();
  const [creds, setCreds] = useState();
  const { data: account } = useAccount();
  let step1Name;
  switch(credType){
    case "idgov" :
      step1Name = "1-start-idv";
      break;
    case "phone" :
      step1Name = "1-2fa";
      break;
    default:
      break;
  } 
  let current = "0-enter-number";
  if(phoneNumber) current = step1Name;
  if((!creds && storing) || (creds && !storing)) current = "2-get-verification-result";
  if(readyToMint) current = "3-mint";
  if(props.retry) current = "retry"; // If there was an issue submitting the minting tx and the user wants to retry
  if(success) current = null;
    
  useEffect(()=>{if (phoneNumber && (current === "1-2fa")) {console.log("sending code to ", phoneNumber); sendCode(phoneNumber)}}, [phoneNumber])

  if (!(allowedCredTypes.includes(credType))) { return }
  if(!account) return <RoundedWindow><ConnectWalletScreen /></RoundedWindow>

  return <RoundedWindow>
    {/* <div style={{display: "flex", alignItems : "center", justifyContent : "center"}}><h2>Mint a Holo</h2></div> */}
    <div className="spacer-medium" />
    <Progress steps={["Phone#", "Verify", "Store", "Mint"] } currentIdx={current?.charAt(0)} />
    <div style={{position: "relative", paddingTop: "100px", width:"100%", height: "90%",/*width:"60vw", height: "70vh",*/ display: "flex", alignItems: "center", justifyContent: "start", flexDirection: "column"}}>
      {(current === "0-enter-number") && <StepPhoneInput onSubmit={setPhoneNumber} />}
      {(current === "1-start-idv") && <StepIDV phoneNumber={phoneNumber} />}
      {(current === "1-2fa") && <Step2FA phoneNumber={phoneNumber} errCallback={setError} callback={setCreds} />}
      {(current === "2-get-verification-result") && <StepStoreCreds prefilledCreds={creds} onCredsStored={c=>{setCreds(c); setReadyToMint(true)}} credType={credType} />}
      {(current === "3-mint") && <StepMint onSuccess={()=>setSuccess(true)} creds={creds} />}
      {success && <StepSuccess />}
      {error && <h3 style={{color:"red"}}>{error}</h3>}
    </div>
  </RoundedWindow>
}
export default Mint;