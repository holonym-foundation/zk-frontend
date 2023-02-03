import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  encryptWithAES,
  setLocalUserCredentials,
  generateSecret,
  getCredentials,
} from "../../utils/secrets";
import { 
  idServerUrl,
  issuerWhitelist,
} from "../../constants/misc";
import { ThreeDots } from "react-loader-spinner";
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";
import { createLeaf } from "../../utils/proofs";

// For test credentials, see id-server/src/main/utils/constants.js

const StoreCredentials = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [readyToLoadCreds, setReadyToLoadCreds] = useState(false);
  const [error, setError] = useState();
  const [declinedToStoreCreds, setDeclinedToStoreCreds] = useState(false);

  const { holoAuthSigDigest } = useHoloAuthSig();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();

  function storeJobID(retrievalEndpoint) {
    // TODO: check for sessionId and id-server veriff endpoint once we migrate to Veriff
    if (
      retrievalEndpoint.includes('jobID') && 
      retrievalEndpoint.includes(`${idServerUrl}/registerVouched/vouchedCredentials`)
    ) {
      const jobID = retrievalEndpoint.split('jobID=')[1]
      localStorage.setItem('jobID', jobID);
    }
  }

  async function loadCredentials() {
    setError(undefined);
    const retrievalEndpoint = window.atob(searchParams.get('retrievalEndpoint'))
    storeJobID(retrievalEndpoint)
    console.log('retrievalEndpoint', retrievalEndpoint)
    const resp = await fetch(retrievalEndpoint)

    // handle error from phone-number-server
    if (resp.status !== 200) {
      throw new Error(await resp.text())
    }

    const data = await resp.json();
    console.log('store-credentials: data', data)
    if (!data) {
      console.error(`Could not retrieve credentials.`);
      throw new Error(`Could not retrieve credentials.`);
    } else if (data.error) {
      // handle error from id-server
      throw new Error(data.error);
    } else {
      return data;
    }
  }

  function getCredsConfirmation(sortedCreds, credsTemp) {
    // Ask user for confirmation if they already have credentials from this issuer
    if (sortedCreds?.[credsTemp.creds.issuerAddress]) {
      console.log('Issuer already in sortedCreds')
      const credsToDisplay = sortedCreds[credsTemp.creds.issuerAddress]?.rawCreds ?? sortedCreds[credsTemp.creds.issuerAddress]
      const confirmation = window.confirm(
        `You already have credentials from this issuer. Would you like to overwrite them? ` +
        "You will not be able to undo this action. " +
        `You would be overwriting: ${JSON.stringify(credsToDisplay, null, 2)}`
      )
      if (confirmation) {
        console.log(`User is overwriting creds from ${credsTemp.creds.issuerAddress}`)
        return true
      } else {
        console.log(`User is not overwriting creds from ${credsTemp.creds.issuerAddress}`)
        return false;
      }
    }
    return true;
  }

  async function mergeAndSetCreds(credsTemp) {
    const lowerCaseIssuerWhitelist = issuerWhitelist.map(issuer => issuer.toLowerCase())
    console.log("credsTemp", credsTemp)
    if (!lowerCaseIssuerWhitelist.includes(credsTemp.creds.issuerAddress.toLowerCase())) {
      setError(`Error: Issuer ${credsTemp.creds.issuerAddress} is not whitelisted.`);
      return;
    }
    // Update the creds with the new secret
    credsTemp.creds.newSecret = await generateSecret();
    credsTemp.creds.serializedAsNewPreimage = [...credsTemp.creds.serializedAsPreimage];
    credsTemp.creds.serializedAsNewPreimage[1] = credsTemp.creds.newSecret;
    credsTemp.newLeaf = await createLeaf(credsTemp.creds.serializedAsNewPreimage);

    // Merge new creds with old creds
    const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest) ?? {};
    const confirmed = getCredsConfirmation(sortedCreds, credsTemp);
    if (!confirmed) {
      setDeclinedToStoreCreds(true);
      return;
    }
    sortedCreds[credsTemp.creds.issuerAddress] = credsTemp;

    // Store creds. Encrypt with AES, using holoAuthSigDigest as the key.
    const encryptedCredentialsAES = encryptWithAES(sortedCreds, holoKeyGenSigDigest);
    setLocalUserCredentials(holoAuthSigDigest, encryptedCredentialsAES);
    window.localStorage.removeItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`);
    if (props.onCredsStored) props.onCredsStored(sortedCreds[credsTemp.creds.issuerAddress]);
  }
  
  // Steps:
  // 1. Get creds from retrievalEndpoint (e.g., phone-number-server or id-server)
  // 2. Merge new creds with current creds
  // 3. Call callback with merged creds

  useEffect(() => {
    // using readyToLoadCreds as a temporary workaround to avoid querying id-server twice
    setReadyToLoadCreds(true);
  }, [])

  useEffect(() => {
    if (!readyToLoadCreds) return;
    (async () => {
      try {
        const credsTemp = await loadCredentials();
        window.localStorage.setItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`, JSON.stringify(credsTemp))
        if (!credsTemp) throw new Error(`Could not retrieve credentials.`);
        await mergeAndSetCreds(credsTemp)
      } catch (err) {
        console.error(err);
        setError(`Error loading credentials: ${err.message}`);
      }
    })()
  }, [readyToLoadCreds])

  return (
    <>
      {declinedToStoreCreds ? (
        <>
          <h3>Minting aborted</h3>
          <p>Made a mistake? Please open a ticket in the{" "}
            <a href="https://discord.gg/2CFwcPW3Bh" target="_blank" rel="noreferrer" className="in-text-link">
              #support-tickets
            </a>{" "}
            channel in the Holonym Discord with a description of your situation.
          </p>
        </>
      ) : (
        <>
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
        <p>Please sign the new messages in your wallet.</p>
        <p>Loading credentials could take a few seconds.</p>
        <p style={{ color: "#f00", fontSize: "1.1rem" }}>{error}</p>
        {error && (
          <p>Please open a ticket in the{" "}
            <a href="https://discord.gg/2CFwcPW3Bh" target="_blank" rel="noreferrer" className="in-text-link">
              #support-tickets
            </a>{" "}
            channel in the Holonym Discord with a description of the error.
          </p>
        )}
        </>
      )}
    </>
  );
};

export default StoreCredentials;
