import { useState, useEffect } from "react";
import loadVouched from "./load-vouched";
import { useParams } from "react-router-dom";
import StoreCredentials from "./components/store-credentials";
import MintButton from "./components/atoms/mint-button";
import Progress from "./components/atoms/progress-bar";
import { WithCheckMark } from "./components/atoms/checkmark";
import "./vouched-css-customization.css";
// import { Success } from "./components/success";

const Step1 = () => (
  <>
    <h1>Download the Holonym Extension</h1>
      <a style={{width:"100%", textAlign: "center" }} target="_blank" className="x-button secondary" href="https://chrome.google.com/webstore/detail/holonym/obhgknpelgngeabaclepndihajndjjnb">Download</a>
  </>
)

const Step2 = () => {
  useEffect(loadVouched, []);
  return <>
    <h1 style={{"marginBottom":"25px"}}>Verify your ID</h1>
    <div id="vouched-element" style={{ height: "10vh"}}></div>
  </>
}

const Step3 = (props) => {
  return <>
    <h1>Store Credentials</h1>
    {<StoreCredentials {...props} />}
  </>
}

const Step4 = (props) => <MintButton {...props} />

const Success = () => <>
  <WithCheckMark size={3}><h1>Success</h1></WithCheckMark>
    <h4>By minting a Holo, you not only created an identity but also made the Privacy Pool (anonymity set) larger</h4>
    <p>! Make sure you remember the browser extension password !</p>
    <br />
    <p><a href="https://holonym.id/whitepaper.pdf" target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>learn the underlying tech</a></p>
    <p><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("hey this is a test")}`} target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>bring more privacy to web3: tweet your privacy pool contribution!</a></p>
    {/* <button className="x-button outline">Learn More</button> */}
    {/* <p>Or <a href="https://holonym.id/whitepaper.pdf" target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>learn more</a></p> */}
</>
const Mint = (props) => {
  const { jobID } = useParams();
  // const [es, setES] = useState({isInstalled : false, isRegistered : false}); // TODO: this should not be isRegistered but rather hasCredentials!!!
  const [success, setSuccess] = useState();
  const [creds, setCreds] = useState();
  const isInstalled = Boolean(window.holonym);

  useEffect(() => {
    async function setup() {
      // setES(await getExtensionState());
    }
    setup(); 
    }, []);

  let current = 1;
  if(isInstalled /*&& !es.hasCredentials*/) current = 2; // TODO: this should not be isRegistered but rather hasCredentials!!!
  if(isInstalled && jobID) current = 3;
  if(isInstalled && creds) current = 4;
  if(isInstalled && props.retry) current = -1; // If there was an issue and the user wants to retry minting using credentials from extension
  console.log("Current", current)
  if(success) current = null;
  return <>
    <div style={{display: "flex", alignItems:"center", justifyContent: "center", flexDirection: "column"}}>
    <div style={{paddingLeft: "5vw", paddingRight: "5vw", width:"70vw", height:"70vh", borderRadius: "100px", border: "1px solid white", display: "flex", justifyContent: "flex-start", flexDirection: "column"}}>
      {/* <div style={{display: "flex", alignItems : "center", justifyContent : "center"}}><h2>Mint a Holo</h2></div> */}
      <div className="spacer-medium" />
      <Progress steps={["Download", "Verify", "Store", "Mint"] } currentIdx={current-1} />
      <div style={{position: "relative", paddingTop: "100px", width:"100%", height: "90%",/*width:"60vw", height: "70vh",*/ display: "flex", alignItems: "center", justifyContent: "start", flexDirection: "column"}}>
      {/* <Step title="Step 1: Download the Holonym Extension" complete={Boolean(window.holonym)} current={current === "download"}> */}
        {(current === 1) && <Step1 />}
        {(current === 2) && <Step2 />}
        {(current === 3) && <Step3 onSetCredsFromExtension={setCreds} />}
        {(current === 4) && <Step4 onSuccess={()=>setSuccess(true)} creds={creds} />}
        {(current === -1) && <Step3 onSetCredsFromExtension={setCreds} jobID="loadFromExtension" />}
        {success && <Success />}
      {/* <Step title="Step 2: Verify your ID" complete={window.holonym?.hasCredentials() current={current === "verify"}>*/}
      {/* <Step2 /> */}
      </div>
      
      
    </div>
    </div>
    {/* } */}
  </>
}
export default Mint;