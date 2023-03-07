/**
 * This component finishes the verification flow for any credential type.
 * It does 2 things (while displaying a loading message):
 * 1. Stores the new credentials.
 * 2. Adds to the Merkle tree a leaf containing the new credentials.
 */
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  encryptWithAES,
  setLocalUserCredentials,
  generateSecret,
} from "../../utils/secrets";
import { 
  idServerUrl,
  issuerWhitelist,
} from "../../constants";
import { ThreeDots } from "react-loader-spinner";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";
import { useCreds } from "../../context/Creds";
import { useProofs } from "../../context/Proofs";
import Relayer from "../../utils/relayer";
import { createLeaf, onAddLeafProof } from "../../utils/proofs";

// For test credentials, see id-server/src/main/utils/constants.js

function useStoreCredentialsState({ setCredsForAddLeaf }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState();
  const [status, setStatus] = useState('loading');
  const [declinedToStoreCreds, setDeclinedToStoreCreds] = useState(false);
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();
  const { reloadCreds } = useCreds();

  function storeJobID(retrievalEndpoint) {
    // TODO: check for sessionId and id-server veriff endpoint once we migrate to Veriff
    if (
      retrievalEndpoint.includes('jobID') && 
      retrievalEndpoint.includes(`${idServerUrl}/v2/registerVouched/vouchedCredentials`)
    ) {
      const jobID = retrievalEndpoint.split('jobID=')[1]
      localStorage.setItem('jobID', jobID);
    }
  }

  async function loadCredentials() {
    console.log('store-credentials: loading credentials')
    setError(undefined);
    const retrievalEndpoint = window.atob(searchParams.get('retrievalEndpoint'))
    storeJobID(retrievalEndpoint)
    console.log('retrievalEndpoint', retrievalEndpoint)
    const resp = await fetch(retrievalEndpoint)

    if (resp.status !== 200) {
      try {
        // These couple lines handle case where this component is rendered multiple times and the API is called multiple times,
        // resulting in a state where the most recent query gets a not ok response, even though the initial query was successful.
        // Note for later: Does using Next.js fix this?
        // We try-catch in case data is for some reason not JSON parsable, in which case we want to return the server's error
        const data = window.localStorage.getItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`)
        if (data) {
          console.log(`store-credentials: cached credentials from retrieval endpoint ${retrievalEndpoint} found in localStorage`)
          return JSON.parse(data);
        }
      } catch (err) {}

      // TODO: Standardize error messages in servers. Have id-sever and phone server return errors in same format (e.g., { error: 'error message' })
      throw new Error(await resp.text())
    }

    const data = await resp.json();
    if (!data) {
      console.error(`Could not retrieve credentials.`);
      throw new Error(`Could not retrieve credentials.`);
    } else {
      // Storing creds in localStorage at multiple points allows us to restore them in case of a (potentially immediate) re-render
      window.localStorage.setItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`, JSON.stringify(data))
      return data;
    }
  }

  async function checkIssuer(credsTemp) {
    console.log('store-credentials: checking issuer');
    const lowerCaseIssuerWhitelist = issuerWhitelist.map(issuer => issuer.toLowerCase())
    console.log("credsTemp", credsTemp);
    if (!lowerCaseIssuerWhitelist.includes(credsTemp.creds.issuerAddress.toLowerCase())) {
      console.log(`Issuer ${credsTemp.creds.issuerAddress} is not whitelisted.`)
      throw new Error(`Issuer ${credsTemp.creds.issuerAddress} is not whitelisted.`);
    }
    console.log('store-credentials: Issuer is whitelisted')
  }

  async function addNewSecret(credsTemp) {
    console.log('store-credentials: adding new secret and new leaf')
    // Update the creds with the new secret
    credsTemp.creds.newSecret = generateSecret();
    credsTemp.creds.serializedAsNewPreimage = [...credsTemp.creds.serializedAsPreimage];
    credsTemp.creds.serializedAsNewPreimage[1] = credsTemp.creds.newSecret;
    credsTemp.newLeaf = await createLeaf(credsTemp.creds.serializedAsNewPreimage);
    console.log('store-credentials: new secret and new leaf added')
    return credsTemp;
  }

  function getCredsConfirmation(sortedCreds, credsTemp) {
    console.log('store-credentials: getting creds confirmation')
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
    console.log('store-credentials: no creds confirmation needed')
    return true;
  }

  async function mergeAndSetCreds(credsTemp) {
    // Merge new creds with old creds
    console.log('store-credentials: merging creds')
    // const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest) ?? {};
    const sortedCreds = await reloadCreds() ?? {};
    const confirmed = getCredsConfirmation(sortedCreds, credsTemp);
    if (!confirmed) {
      setDeclinedToStoreCreds(true);
      return;
    }
    sortedCreds[credsTemp.creds.issuerAddress] = credsTemp;

    // Store creds. Encrypt with AES, using holoKeyGenSigDigest as the key.
    console.log('store-credentials: setting creds')
    const encryptedCredentialsAES = encryptWithAES(sortedCreds, holoKeyGenSigDigest);
    // Storing creds in localStorage at multiple points allows us to restore them in case of a (potentially immediate) re-render
    window.localStorage.setItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`, JSON.stringify(credsTemp))
    setLocalUserCredentials(encryptedCredentialsAES);
    setCredsForAddLeaf(sortedCreds[credsTemp.creds.issuerAddress]);
    setStatus('success');
  }
  
  // Steps:
  // 1. Get creds from retrievalEndpoint (e.g., phone-number-server or id-server)
  // 2. Merge new creds with current creds
  // 3. Call callback with merged creds

  useEffect(() => {
    (async () => {
      try {
        const credsTemp = await loadCredentials();
        if (!credsTemp) throw new Error(`Could not retrieve credentials.`);
        if (credsTemp?.newLeaf) {
          // If creds already has new leaf, then they must have been restored from localStorage
          // and we just need to merge and return them
          await mergeAndSetCreds(credsTemp);
        } else {
          await checkIssuer(credsTemp);
          await addNewSecret(credsTemp);
          await mergeAndSetCreds(credsTemp);
        }
      } catch (err) {
        console.error(err);
        setError(`Error loading credentials: ${err.message}`);
        setStatus('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    declinedToStoreCreds,
    error,
    status,
  }
}

function useAddLeafState({ onSuccess }) {
  const [error, setError] = useState();
  const [credsForAddLeaf, setCredsForAddLeaf] = useState();
  const [readyToSendToServer, setReadyToSendToServer] = useState(false);
  const { reloadCreds, storeCreds } = useCreds();
  const { loadKOLPProof, kolpProof, loadProofs } = useProofs();

  async function sendCredsToServer() {
    const sortedCreds = await reloadCreds();
    const success = await storeCreds(sortedCreds, kolpProof);
    if (!success) {
      setError('Error: Could not send credentials to server.')
    } else {
      // Remove plaintext credentials from local storage now that they've been backed up
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith('holoPlaintextCreds')) {
          console.log('removing', key, 'from local storage')
          window.localStorage.removeItem(key);
        }
      }
    }
  }

  async function addLeaf() {
    const circomProof = await onAddLeafProof(credsForAddLeaf);
    console.log("circom proooooof", circomProof);
    const result = await Relayer.mint(
      circomProof, 
      async () => {
        loadKOLPProof(credsForAddLeaf.creds.newSecret, credsForAddLeaf.creds.serializedAsNewPreimage)
        setReadyToSendToServer(true);
      }, 
      () => {
        setError('Error: An error occurred while minting.')
      }
    );
  }

  // Steps:
  // 1. Generate addLeaf proof and call relayer addLeaf endpoint
  // 2. Generate KOLP proof using creds in newly added leaf, send to server, and call onSuccess

  useEffect(() => {
    if (!credsForAddLeaf) return;
    addLeaf();
  }, [credsForAddLeaf])

  useEffect(() => {
    if (!kolpProof || !readyToSendToServer) return;
    sendCredsToServer()
      .then(() => {
        onSuccess()
        loadProofs(true); // force a reload of all proofs since a new leaf has been added
      });
  }, [kolpProof, readyToSendToServer])
  
  return {
    error,
    setCredsForAddLeaf
  };
}

const FinalStep = ({ onSuccess }) => {
  const { error: addLeafError, setCredsForAddLeaf } = useAddLeafState({ onSuccess });
  const { 
    declinedToStoreCreds, 
    error: storeCredsError, 
    status: storeCredsStatus 
  } = useStoreCredentialsState({ setCredsForAddLeaf });
  const error = useMemo(
    () => addLeafError ?? storeCredsError, 
    [addLeafError, storeCredsError]
  );
  const loadingMessage = useMemo(() => {
    if (storeCredsStatus === 'loading') return 'Loading credentials';
    if (storeCredsStatus === 'success') return 'Adding leaf to Merkle tree';
  }, [storeCredsStatus])

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
      ) : error ? (
        <>
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
      ) : (
        <>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
            <h3 style={{ textAlign: "center", paddingRight:"10px"}}>{loadingMessage}</h3>
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
          {storeCredsStatus === 'loading' && (
            <>
              {/* <p>Please sign the new messages in your wallet.</p> */}
              <p>Loading credentials could take a few seconds.</p>
            </>
          )}
        </>
      )}
    </>
  );
};

export default FinalStep;
