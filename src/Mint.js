import { useState, useEffect } from "react";
import loadVouched from "./load-vouched";
import { getExtensionState } from "./utils/extension-helpers";
import { useParams } from "react-router-dom";
import StoreCredentials from "./components/store-credentials";
import { Step } from "./components/atoms/Step";
import MintButton from "./components/atoms/mint-button";
import Progress from "./components/atoms/progress-bar";
  
const Step1 = () => (
  <>
    <h1>Download the Holonym Extension</h1>
      <a style={{width:"100%", textAlign: "center" }} target="_blank" className="x-button secondary" href="https://chrome.google.com/webstore/detail/holonym/obhgknpelgngeabaclepndihajndjjnb">Download</a>
  </>
)

const Step2 = () => {
  useEffect(loadVouched, []);
  return <>
    <h1>Step 2: Verify your ID</h1>
    <div id="vouched-element" style={{ height: "100%" }}></div>
  </>
}

const Step3 = (props) => {
  return <>
    <h1>Step 2: Verify your ID</h1>
    {<StoreCredentials {...props} />}
  </>
}

const Step4 = ({creds}) => <MintButton creds={creds} />

const Mint = () => {
  const { jobID } = useParams();
  const [userJourney, setUserJourney] = useState({isInstalled : false, isRegistered : false}); // TODO: this should not be isRegistered but rather hasCredentials!!!
  const [current, setCurrent] = useState(1); // Controls which current step of instructions is displayed
  const [creds, setCreds] = useState();
  useEffect(() => {
    async function setup() {
      const s = await getExtensionState();
      setUserJourney(s);
      if(s.isInstalled && !s.hasCredentials){ // TODO: this should not be isRegistered but rather hasCredentials!!!
        // setCurrent("verify"); 
        // if(!jobID)loadVouched();
      }
    }
    setup(); 
    }, []);

  return <>
    {/* Let user try again in case of error */}
    {(!jobID && userJourney.isInstalled && userJourney.hasCredentials) ? <StoreCredentials jobID="tryMintingAgain" /> : 
    /* Otherwise, show the typical page*/
    <div style={{display: "flex", alignItems:"center", justifyContent: "center", flexDirection: "column"}}>
    <div style={{paddingLeft: "5vw", paddingRight: "5vw", width:"70vw", height:"70vh", borderRadius: "100px", border: "1px solid white", display: "flex", justifyContent: "flex-start", flexDirection: "column"}}>
      <div style={{display: "flex", alignItems : "center", justifyContent : "center"}}><h2>Mint it!</h2></div>
      <Progress steps={["Download", "Verify", "Store Credentials", "Mint ur Holo"] } currentIdx={current-1} />
      <div style={{position: "relative", paddingTop: "100px", width:"100%", height: "90%",/*width:"60vw", height: "70vh",*/ display: "flex", alignItems: "center", justifyContent: "start", flexDirection: "column"}}>
      {/* <Step title="Step 1: Download the Holonym Extension" complete={Boolean(window.holonym)} current={current === "download"}> */}
        {(current === 1) && <Step1 />}
        {(current === 2) && <Step2 />}
        {(current === 3) && <Step3 onSetCredsFromExtension={setCreds} />}
        {(current === 4) && <Step4 creds={creds} />}
      {/* <Step title="Step 2: Verify your ID" complete={window.holonym?.hasCredentials() current={current === "verify"}>*/}
      {/* <Step2 /> */}
      </div>
      
      
    </div>
    </div>
    }
  </>
}
export default Mint;