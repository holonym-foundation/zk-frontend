import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {
  storeCredentials,
  getIsHoloRegistered,
  requestCredentials,
} from "../utils/secrets";
import { zkIdVerifyEndpoint, serverAddress } from "../constants/misc";
import {
  getStateAsHexString,
  getDateAsHexString,
} from "../utils/proofs";
import { ThreeDots } from "react-loader-spinner";
import { Success } from "./success";
import MintButton from "./atoms/mint-button";

// For test credentials, see id-server/src/main/utils/constants.js

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForUserRegister() {
  let isRegistered = await getIsHoloRegistered();
  while (!isRegistered) {
    await sleep(100);
    isRegistered = await getIsHoloRegistered();
  }
}

// Display success message, and retrieve user credentials to store in browser
const Verified = (props) => {
  // const p = useParams();
  // const jobID = p.jobID || props.jobID;
  const { jobID } = useParams();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [credsAreStored, setCredsAreStored] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [successScreen, setSuccessScreen] = useState(false);
  const [minting, setMinting] = useState(false);
  // TODO: Check whether user is logged in too
  const [creds, setCreds] = useState();

  async function loadCredentials() {
    setError(undefined);
    setLoading(true);
    try {
      const resp = await fetch(
        `${zkIdVerifyEndpoint}/registerVouched/vouchedCredentials?jobID=${jobID}`
      );
      // Shape of data == { user: completeUser }
      const data = await resp.json();
      if (!data || data.error) {
        console.error(`Could not retrieve credentials. Details: ${data.error}`);
        return;
      } else {
        setLoading(false);
        const credsTemp = data.user;
        setCreds(credsTemp);
        return credsTemp;
      }
    } catch (err) {
      console.error(`Could not retrieve credentials. Details: ${err}`);
    }
  }

  async function setCredsFromExtension() {
    try {
      // Request credentials. Need to request because extension generates new secret
      const sortedCreds = await requestCredentials();
      const creds_ = sortedCreds[serverAddress];
      const formattedCreds = {
        ...creds_,
        subdivisionHex: getStateAsHexString(
          creds_.subdivision,
          creds_.countryCode
        ),
        completedAtHex: getDateAsHexString(creds_.completedAt),
        birthdateHex: getDateAsHexString(creds_.birthdate),
      }
      setCreds(formattedCreds);
      console.log(formattedCreds, props.onSetCredsFromExtension);
      props.onSetCredsFromExtension && props.onSetCredsFromExtension(formattedCreds);
    } catch (e) {
      console.error(e);
      setError("There was a problem in storing your credentials");
    }
  }

  useEffect(() => {
    async function func() {
      const isRegistered = await getIsHoloRegistered();
      // Only setRegistered at this first check. If user had not registered before
      // reaching this page, we want to keep on the page the instructions for the
      // non-registered user
      setRegistered(isRegistered);
      if (!isRegistered) {
        await waitForUserRegister();
        setError(undefined);
      }
      console.log("props", props)
      // If user has already stored credentials (e.g., they weren't able to successfully mint and are trying again, this will let them get credentials from extension withotu redoing verification, which they would be banned from)
      if(props.jobID === "loadFromExtension"){
        console.log("loading from extenssion", props)
        setCredsFromExtension();
        return;
      }
      const credsTemp = await loadCredentials();
      if (!credsTemp) {
        setError(`Error: Could not retrieve credentials.`);
        return;
      }

      try {
        setCreds({
          ...credsTemp,
          subdivisionHex: getStateAsHexString(
            credsTemp.subdivision,
            credsTemp.countryCode
          ),
          completedAtHex: getDateAsHexString(credsTemp.completedAt),
          birthdateHex: getDateAsHexString(credsTemp.birthdate),
        });
      } catch (e) {
        console.error(
          `There was a problem in storing your credentials. Details: ${e}`
        );
        setError("Error: There was a problem in storing your credentials");
      }

      const success = await storeCredentials(credsTemp);
      setCredsAreStored(success);
      if (success)
        setCredsFromExtension();
      else {
        setError("Could not receive confirmation from user to store credentials");
      }
    }
    try {
      func();
    } catch (err) {
      console.log(err);
      setError(`Error: ${err.message}`);
    }
    // For tests
    // setLoading(false);
    // storeCredentials(dummyUserCreds).then(async (success) => {
    //   const newCreds = await requestCredentials();
    //   setCreds({
    //     ...newCreds,
    //     subdivisionHex: getStateAsHexString(newCreds.subdivision),
    //     completedAtHex: getDateAsHexString(newCreds.completedAt),
    //     birthdateHex: getDateAsHexString(newCreds.birthdate),
    //   });
    //   setCredsAreStored(success);
    // });
  }, []);

  

  if (successScreen) {
    return <Success />;
  }
  console.log(creds, credsAreStored, registered)
  return (
    <>
      {loading ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
      }}>
      <h3 style={{ textAlign: "center", paddingRight:"10px"}}>Loading credentials</h3>
      <ThreeDots 
        height="20" 
        width="40" 
        radius="2"
        color="#FFFFFF" 
        ariaLabel="three-dots-loading"
        wrapperStyle={{marginBottom:"-20px"}}
        wrapperClassName=""
        visible={true}
        />
    </div>
        
      ) : (
        <div>
          <div style={{ maxWidth: "600px", fontSize: "16px" }}>
              <ol>
                {!registered && (
                  <li>
                    <p>
                      Open the Holonym extension, and create an account by entering a
                      password (be sure to remember it)
                    </p>
                  </li>
                )}
                <li>
                  <p>
                    Login to the Holonym popup{" "}
                    {!registered && "(after creating an account)"}
                  </p>
                </li>
                <li>
                  <p>Confirm your credentials</p>
                </li>
                {/* <li>
                  <p>Mint your Holo:</p>
                </li> */}
              </ol>
            {/* {creds && credsAreStored && <MintButton creds={creds} successCallback={()=>setSuccessScreen(true)} />} */}
          </div>
        </div>
      )}
      <p>{error}</p>
      {error && (
        <p>
          Please email Holonym support at{" "}
          <a href="mailto:help@holonym.id">help@holonym.id</a> with a description of
          the error.
        </p>
      )}
    </>
  );
};

export default Verified;
