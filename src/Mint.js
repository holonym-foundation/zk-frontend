import { useState, useEffect } from "react";
import loadVouched from "./load-vouched";
import { getExtensionState } from "./utils/extension-helpers";
import { useParams } from "react-router-dom";
import StoreCredentials from "./components/store-credentials";
import { Step } from "./components/atoms/Step";
import MintButton from "./components/atoms/mint-button";
    
const Mint = () => {
  const { jobID } = useParams();
    const [userJourney, setUserJourney] = useState({isInstalled : false, isRegistered : false}); // TODO: this should not be isRegistered but rather hasCredentials!!!
    const [current, setCurrent] = useState("download"); // Controls which current step of instructions is displayed
    useEffect(() => {
      async function setup() {
        const s = await getExtensionState();
        setUserJourney(s);
        if(s.isInstalled && !s.hasCredentials){ // TODO: this should not be isRegistered but rather hasCredentials!!!
          setCurrent("verify"); 
          if(!jobID)loadVouched();
        }
      }
      setup(); 
      }, []);

    return <>
      {/* Let user try again in case of error */}
      {(!jobID && userJourney.isInstalled && userJourney.hasCredentials) ? <StoreCredentials jobID="tryMintingAgain" /> : 
      /* Otherwise, show the typical page*/
      <>
        <Step title="Step 1: Download the Holonym Extension" complete={Boolean(window.holonym)} current={current === "download"}>
          <a target="_blank" className="x-button secondary" href="https://chrome.google.com/webstore/detail/holonym/obhgknpelgngeabaclepndihajndjjnb">Download</a>
        </Step>

        <Step title="Step 2: Verify your ID" complete={window.holonym?.hasCredentials/*()*/} current={current === "verify"}>
          {jobID ? <StoreCredentials jobID={jobID} /> : <div id="vouched-element" style={{ height: "100%" }}></div>}
        </Step>
      </>
      }
     
      
      
      
    </>
}
export default Mint;