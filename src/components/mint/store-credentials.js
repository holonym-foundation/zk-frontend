import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  encryptObject,
  setLocalUserCredentials,
  getLocalEncryptedUserCredentials,
  decryptObjectWithLit,
  generateSecret,
} from "../../utils/secrets";
import { 
  idServerUrl,
  issuerWhitelist,
} from "../../constants/misc";
import { ThreeDots } from "react-loader-spinner";
import { useLitAuthSig } from '../../context/LitAuthSig';
import { useHoloAuthSig } from "../../context/HoloAuthSig";

// For test credentials, see id-server/src/main/utils/constants.js

// Comment:
// LitJsSdk.disconnectWeb3()

const StoreCredentials = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [readyToLoadCreds, setReadyToLoadCreds] = useState();
  const [error, setError] = useState();
  const [declinedToStoreCreds, setDeclinedToStoreCreds] = useState(false);

  const { getLitAuthSig, signLitAuthMessage } = useLitAuthSig();
  const {
    signHoloAuthMessage,
    holoAuthSigIsError,
    holoAuthSigIsLoading,
    holoAuthSigIsSuccess,
    getHoloAuthSigDigest,
  } = useHoloAuthSig();

  async function loadCredentials() {
    setError(undefined);
    const retrievalEndpoint = window.atob(searchParams.get('retrievalEndpoint'))
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
    if (sortedCreds[credsTemp.issuer]) {
      console.log('Issuer already in sortedCreds')
      const credsToDisplay = sortedCreds[credsTemp.issuer]?.rawCreds ?? sortedCreds[credsTemp.issuer]
      const confirmation = window.confirm(
        `You already have credentials from this issuer. Would you like to overwrite them? ` +
        "You will not be able to undo this action. " +
        `You would be overwriting: ${JSON.stringify(credsToDisplay, null, 2)}`
      )
      if (confirmation) {
        console.log(`User is overwriting creds from ${credsTemp.issuer}`)
        return true
      } else {
        console.log(`User is not overwriting creds from ${credsTemp.issuer}`)
        return false;
      }
    }
    return true;
  }

  async function getAndDecryptCurrentCreds() {
    let encryptedCurrentCreds = getLocalEncryptedUserCredentials()
    if (!encryptedCurrentCreds) {
      try {
        const resp = await fetch(`${idServerUrl}/credentials?sigDigest=${getHoloAuthSigDigest()}`)
        const data = await resp.json();
        if (!data.error) encryptedCurrentCreds = data;
      } catch (err) {
        console.log(err)
      }
    }
    let sortedCreds = {};
    if (encryptedCurrentCreds) {
      const { sigDigest, encryptedCredentials, encryptedSymmetricKey } = encryptedCurrentCreds;
      const currentSortedCreds = await decryptObjectWithLit(encryptedCredentials, encryptedSymmetricKey, getLitAuthSig());
      sortedCreds = {...currentSortedCreds};
    }
    return sortedCreds
  }

  async function mergeAndSetCreds(credsTemp) {
    const lowerCaseIssuerWhitelist = issuerWhitelist.map(issuer => issuer.toLowerCase())
    if (!lowerCaseIssuerWhitelist.includes(credsTemp.issuer.toLowerCase())) {
      setError(`Error: Issuer ${credsTemp.issuer} is not whitelisted.`);
      return;
    }
    credsTemp.newSecret = generateSecret();
    // Merge new creds with old creds
    const sortedCreds = await getAndDecryptCurrentCreds();
    const confirmed = getCredsConfirmation(sortedCreds, credsTemp);
    if (!confirmed) {
      setDeclinedToStoreCreds(true);
      return;
    }
    sortedCreds[credsTemp.issuer] = credsTemp;

    // Store creds
    const holoAuthSigDigest = getHoloAuthSigDigest();
    if (!holoAuthSigDigest) {
      setError("Error: Could not get user signature");
      return;
    }
    const { encryptedString, encryptedSymmetricKey } = await encryptObject(sortedCreds, getLitAuthSig());
    setLocalUserCredentials(holoAuthSigDigest, encryptedString, encryptedSymmetricKey)
    window.localStorage.removeItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`)
    if (props.onCredsStored) props.onCredsStored(sortedCreds[credsTemp.issuer])
  }
  
  // Steps:
  // 1. Get & set litAuthSig and holoAuthSigDigest
  // 2. Get creds from retrievalEndpoint (e.g., phone-number-server or id-server)
  // 3. Merge new creds with current creds
  // 4. Call callback with merged creds
  useEffect(() => {
    (async () => {
      if (!getLitAuthSig()) {
        await signLitAuthMessage();
      }
      if (!getHoloAuthSigDigest()) {
        await signHoloAuthMessage();
      }
      setReadyToLoadCreds(true);
    })()
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
