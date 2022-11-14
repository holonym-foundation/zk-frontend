import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSignMessage } from 'wagmi'
import LitJsSdk from "@lit-protocol/sdk-browser";

import {
  encryptUserCredentials,
  setUserCredentials,
  getEncryptedUserCredentials,
  decryptUserCredentials,
  generateSecret,
  sha256,
} from "../utils/secrets";
import { idServerUrl, serverAddress, holonymAuthMessage } from "../constants/misc";
import {
  getDateAsInt,
} from "../utils/proofs";
import { ThreeDots } from "react-loader-spinner";
import { Success } from "./success";
import MintButton from "./atoms/mint-button";

// For test credentials, see id-server/src/main/utils/constants.js

// Display success message, and retrieve user credentials to store in browser
const Verified = (props) => {
  // const p = useParams();
  // const jobID = p.jobID || props.jobID;
  const { jobID } = useParams();
  const [sortedCreds, setSortedCreds] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [successScreen, setSuccessScreen] = useState(false);
  const [minting, setMinting] = useState(false);
  const { 
    data: holoAuthSig, 
    isError: holoAuthSigIsError, 
    isLoading, 
    isSuccess: holoAuthSigIsSuccess, 
    signMessage 
  } = useSignMessage({ message: holonymAuthMessage })

  async function loadCredentials() {
    setError(undefined);
    setLoading(true);
    try {
      const resp = await fetch(
        `${idServerUrl}/registerVouched/vouchedCredentials?jobID=${jobID}`
      );
      // Shape of data == { user: completeUser }
      const data = await resp.json();
      if (!data || data.error) {
        console.error(`Could not retrieve credentials. Details: ${data.error}`);
        return;
      } else {
        setLoading(false);
        return data.user;
      }
    } catch (err) {
      console.error(`Could not retrieve credentials. Details: ${err}`);
    }
  }

  useEffect(() => {
    async function func() {
      // TODO: Check that
      // 1. user has wallet
      // 2. wallet is unlocked (i.e., user is logged into it)

      console.log("props", props)
      // If user has already retrieved and stored their credentials, we shouldn't
      // generate a new secret for them; we should just set creds for the next step
      if (props.jobID === 'retryMint') {
        console.log('retrying mint')
        const { sigDigest, encryptedCredentials, encryptedSymmetricKey } = await getEncryptedUserCredentials()
        const currentSortedCreds = await decryptUserCredentials(encryptedCredentials, encryptedSymmetricKey)
        const formattedCreds = {
          ...currentSortedCreds[serverAddress],
          subdivisionHex: "0x" + Buffer.from(currentSortedCreds[serverAddress].subdivision).toString("hex"),
          completedAtHex: getDateAsInt(currentSortedCreds[serverAddress].completedAt),
          birthdateHex: getDateAsInt(currentSortedCreds[serverAddress].birthdate),
        }
        console.log(formattedCreds, props.onCredsStored);
        props.onCredsStored && props.onCredsStored(formattedCreds);
        return;
      }
      const credsTemp = await loadCredentials();
      if (!credsTemp) {
        setError(`Error: Could not retrieve credentials.`);
        return;
      }

      credsTemp.newSecret = generateSecret();

      let newSortedCreds;
      const encryptedCurrentCredsResp = await getEncryptedUserCredentials()
      if (encryptedCurrentCredsResp) {
        const { sigDigest, encryptedCredentials, encryptedSymmetricKey } = encryptedCurrentCredsResp
        const currentSortedCreds = await decryptUserCredentials(encryptedCredentials, encryptedSymmetricKey)
        newSortedCreds = { ...currentSortedCreds, [serverAddress]: credsTemp }
      } else {
        newSortedCreds = { [serverAddress]: credsTemp }
      }
      setSortedCreds(newSortedCreds);
      signMessage()
      // This flow is continued in the next useEffect, after user signs holo auth message
    }
    try {
      func();
    } catch (err) {
      console.log(err);
      setError(`Error: ${err.message}`);
    }
  }, []);

  useEffect(() => {    
    async function func() {
      if (!holoAuthSig && !holoAuthSigIsSuccess) return;
      if (holoAuthSigIsError) {
        throw new Error('Failed to sign Holonym authentication message needed to store credentials.')
      }
      const sigDigest = await sha256(holoAuthSig);
      const { encryptedString, encryptedSymmetricKey } = await encryptUserCredentials(sortedCreds);
      const storageSuccess = setUserCredentials(sigDigest, encryptedString, encryptedSymmetricKey)
      if (!storageSuccess) {
        console.log('Failed to store user credentials in localStorage')
        setError("Error: There was a problem in storing your credentials");
      }
      const formattedCreds = {
        ...sortedCreds[serverAddress],
        subdivisionHex: "0x" + Buffer.from(sortedCreds[serverAddress].subdivision).toString("hex"),
        completedAtHex: getDateAsInt(sortedCreds[serverAddress].completedAt),
        birthdateHex: getDateAsInt(sortedCreds[serverAddress].birthdate),
      }
      console.log(formattedCreds, props.onCredsStored);
      props.onCredsStored && props.onCredsStored(formattedCreds);
    }
    try {
      func();
      LitJsSdk.disconnectWeb3(); // Clear authSig
    } catch (err) {
      console.log(err);
      setError(`Error: ${err.message}`);
    }
  }, [holoAuthSig])

  if (successScreen) {
    return <Success />;
  }
  // console.log(creds, credsAreStored, registered)
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
                <li>
                  <p>Sign the messages in the wallet popups. This allows you to encrypt and store your credentials</p>
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
