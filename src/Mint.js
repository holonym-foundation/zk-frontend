import { useState, useEffect } from "react";
import loadVouched from "./load-vouched";
import { getExtensionState } from "./utils/extension-helpers";
import { useParams } from "react-router-dom";
import Verified from "./components/verified";
    
const Mint = () => {
  const { jobID } = useParams();
    const [userJourney, setUserJourney] = useState({isInstalled : false, isRegistered : false});
    useEffect(() => {
      async function setup() {
        const s = await getExtensionState();
        setUserJourney(s);
        if(s.isInstalled && !s.isRegistered) loadVouched();
      }
      setup(); 
      }, []);
      
    return <>
      <div id="vouched-element" style={{ height: "100%" }}></div>
      {(jobID && userJourney.isInstalled) ? <Verified jobID={jobID} /> : null}
      {/* Allow user to also see screen */}
      {(!jobID && userJourney.isInstalled && userJourney.isRegistered) ? <Verified jobID="tryAddLeafAgain" /> : null}
    </>
}
export default Mint;