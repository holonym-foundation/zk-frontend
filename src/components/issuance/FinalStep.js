/**
 * This component finishes the verification flow for any credential type.
 * It does 2 things (while displaying a loading message):
 * 1. Stores the new credentials.
 * 2. Adds to the Merkle tree a leaf containing the new credentials.
 */
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { isEqual } from 'lodash';
import { useSessionStorage } from "usehooks-ts";
import {
  encryptWithAES,
  setLocalUserCredentials,
  generateSecret,
} from "../../utils/secrets";
import { 
  idServerUrl,
  relayerUrl,
  issuerWhitelist,
} from "../../constants";
import { ThreeDots } from "react-loader-spinner";
import { Modal } from "../atoms/Modal";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";
import { useCreds } from "../../context/Creds";
import { useProofs } from "../../context/Proofs";
import Relayer from "../../utils/relayer";
import { createLeaf, onAddLeafProof } from "../../utils/proofs";

// For test credentials, see id-server/src/main/utils/constants.js

// TODO: Low priority: Change retrievalEndpoint s.t. base64 encoding is not necessary. This
// requires changing all places that point to this component, including all issuance flows in
// this repo and in example-issuer.
// const retrievalEndpoint = window.atob(searchParams.get('retrievalEndpoint'))
export function useRetrieveNewCredentials({ setError, retrievalEndpoint }) {
  const [newCreds, setNewCreds] = useSessionStorage(`holoNewCredsFromIssuer-${retrievalEndpoint}`, undefined);

  // TODO: Validate creds before setting newCreds. If creds are invalid, set error, and do
  // not set newCreds.

  useEffect(() => {
    if (!retrievalEndpoint || !setError) return;
    console.log('useRetrieveNewCredentials: loading credentials');
    setError(undefined);
    storeSessionId(retrievalEndpoint);
    retrieveNewCredentials()
      .then((newCredsTemp) => setNewCreds(newCredsTemp))
      .catch((error) => setError(error.message))
  }, [retrievalEndpoint]);

  async function retrieveNewCredentials() {
    console.log('useRetrieveNewCredentials: retrievalEndpoint', retrievalEndpoint);
    // We try to fetch before trying to restore from sessionStorage because we want to be
    // 100% sure that we have the latest available credentials. The try-catch around fetch
    // handles cases where fetch fails (e.g., due to network error); in such cases, we still
    // want to check if newCreds are present in sessionStorage.
    let resp = {};
    try {
      resp = await fetch(retrievalEndpoint);
    } catch (err) {
      console.log('useRetrieveNewCredentials:', err);
      resp.text = () => new Promise((resolve) => resolve(err.message));
    }
    if (resp?.status === 200) {
      const data = await resp.json();
      if (!data) {
        console.error(`Could not retrieve credentials. No credentials found.`);
        throw new Error(`Could not retrieve credentials. No credentials found.`);
      } else {
        // Storing creds in localStorage at multiple points allows us to restore them in case of a (potentially immediate) re-render
        // window.localStorage.setItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`, JSON.stringify(data))
        console.log('useRetrieveNewCredentials: Returning credentials from fetch result', data)
        return data;
      }
    } else {
      // We only attempt to restore from sessionStorage if the fetch failed.
      if (newCreds) {
        console.log(`store-credentials: Returning creds recovered from sessionStorage credentials from retrieval endpoint ${retrievalEndpoint}`)
        return newCreds;
      }
      console.log('useRetrieveNewCredentials: Retrieval endpoint returned non-200 status code');
      // If resp.status is not 200, and if we could not recover from sessionStorage, then the server
      // must have returned an error, which we want to display to the user.
      // TODO: Standardize error messages in servers. Have id-sever and phone server return errors in same format (e.g., { error: 'error message' })
      throw new Error(await resp.text())
    }
  }

  function storeSessionId(retrievalEndpoint) {
    if (
      retrievalEndpoint.includes('veriff-sessionId') && 
      retrievalEndpoint.includes(`${idServerUrl}/veriff/credentials`)
    ) {
      const sessionId = retrievalEndpoint.split('sessionId=')[1]
      localStorage.setItem('veriff-sessionId', sessionId);
    }
  }

  return {
    newCreds,
  }
}

// This function:
// - Must add a new secret (and newLeaf and serializedAsNewPreimage) to credentials.
// - Cannot add the same secret to credentials from different retrieval endpoints.
// - Cannot add the same secret to credentials from the same issuer retrieved at a different time.
// - Must add THE SAME new secret to credentials in case of a re-render or refresh where the user
//   is in the same issuance session. TODO: How can we demarcate an issuance session?
export function useAddNewSecret({ retrievalEndpoint, newCreds }) {
  const newSecretRef = useRef();
  // const [newSecret, setNewSecret] = useSessionStorage(`holoNewSecret-${retrievalEndpoint}`, undefined);
  const [newCredsWithNewSecret, setNewCredsWithNewSecret] = useState();

  // Since a useEffect with an empty dependency array is only called once and is run
  // synchronously, we can use it to set the new secret without worrying about a re-render
  // or refresh causing one "thread" to set one secret and another "thread" to set a different
  // secret.
  useEffect(() => {
    // We assume the user will not need to retrieve credentials multiple times--for different 
    // leaves--from the same issuer during the same browser session, so we are safe to use
    // sessionStorage to store the new secret.
    const storedSecret = sessionStorage.getItem(`holoNewSecret-${retrievalEndpoint}`);
    if (storedSecret) {
      console.log('useAddNewSecret: useEffect called. Setting newSecret recovered from sessionStorage.')
      newSecretRef.current = storedSecret;
    } else {
      console.log('useAddNewSecret: useEffect called. Setting newSecret to result of generateSecret().')
      newSecretRef.current = generateSecret();
      sessionStorage.setItem(`holoNewSecret-${retrievalEndpoint}`, newSecretRef.current);
    }
  }, []);

  // Since newSecret is set synchronously and for the whole user session upon the rendering
  // of this component, we don't have to worry about how many times this useEffect is called.
  useEffect(() => {
    if (!retrievalEndpoint || !newCreds || !newSecretRef.current) return;
    (async () => {
      const credsTemp = { ...newCreds };
      credsTemp.creds.newSecret = newSecretRef.current
      credsTemp.creds.serializedAsNewPreimage = [...credsTemp.creds.serializedAsPreimage];
      credsTemp.creds.serializedAsNewPreimage[1] = credsTemp.creds.newSecret;
      credsTemp.newLeaf = await createLeaf(credsTemp.creds.serializedAsNewPreimage);
      setNewCredsWithNewSecret(credsTemp);
      // window.localStorage.setItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`, JSON.stringify(credsTemp))
      console.log('useAddNewSecret: Called setNewCredsWithNewSecret ')
    })();
  }, [retrievalEndpoint, newCreds, newSecretRef]);

  return {
    newCredsWithNewSecret,
  }
}

// This hook MUST NOT set mergedSortedCreds unless the new creds have been confirmed to be stored
// in sortedCreds.
// sortedCreds == user's complete sorted credentials
// newCreds == new creds from the current retrieval endpoint
export function useMergeCreds({ setError, sortedCreds, loadingCreds, newCreds }) {
  const [confirmationStatus, setConfirmationStatus] = useState('init'); // 'init' | 'confirmed' | 'denied' | 'confirmationRequired'
  const [credsThatWillBeOverwritten, setCredsThatWillBeOverwritten] = useState();
  const [mergedSortedCreds, setMergedSortedCreds] = useState();

  const onConfirmOverwrite = () => {
    console.log(`User is overwriting creds from ${newCreds?.creds?.issuerAddress}`);
    setConfirmationStatus('confirmed');
  };
  const onDenyOverwrite = () => {
    console.log(`User is not overwriting creds from ${newCreds?.creds?.issuerAddress}`);
    setConfirmationStatus('denied');
  };

  useEffect(() => {
    if (confirmationStatus !== 'init') return;
    if ((!loadingCreds && !sortedCreds) || loadingCreds) return;
    if (!newCreds?.creds?.issuerAddress) return;
    if (!setError) return;

    console.log('useMergeCreds: Checking that issuer is whitelisted');
    const lowerCaseIssuerWhitelist = issuerWhitelist.map(issuer => issuer.toLowerCase())
    console.log("useMergeCreds: newCreds:", newCreds);
    if (!lowerCaseIssuerWhitelist.includes(newCreds.creds.issuerAddress.toLowerCase())) {
      console.log(`useMergeCreds: Issuer ${newCreds.creds.issuerAddress} is not whitelisted.`);
      setError(`Issuer ${newCreds.creds.issuerAddress} is not whitelisted.`);
      return;
    }
    console.log('useMergeCreds: Issuer is whitelisted')

    console.log('useMergeCreds: Getting creds confirmation');
    // Ask user for confirmation if they already have credentials from this issuer
    if (sortedCreds?.[newCreds.creds.issuerAddress]) {
      if (JSON.stringify(sortedCreds[newCreds.creds.issuerAddress]) === JSON.stringify(newCreds)) {
        // For cases of immediate re-render
        console.log('useMergeCreds: getCredsConfirmation: creds are the same, no confirmation needed');
        setConfirmationStatus('confirmed');
        return;
      }
      console.log('useMergeCreds: Issuer already in sortedCreds');
      setConfirmationStatus('confirmationRequired');
      setCredsThatWillBeOverwritten(sortedCreds[newCreds.creds.issuerAddress]);
    } else {
      console.log('useMergeCreds: no creds confirmation needed');
      setConfirmationStatus('confirmed');
    }
  }, [sortedCreds, loadingCreds, newCreds])

  useEffect(() => {
    if (!sortedCreds || !newCreds?.creds?.issuerAddress || confirmationStatus !== 'confirmed') return;
    
    const mergedSortedCredsTemp = { 
      ...sortedCreds,
      [newCreds.creds.issuerAddress]: newCreds,
    };
    if (isEqual(mergedSortedCreds, mergedSortedCredsTemp)) {
      console.log('useMergeCreds: mergedSortedCreds is the same, no need to set it again');
      return;
    }
    console.log('useMergeCreds: calling setMergedSortedCreds');
    setMergedSortedCreds(mergedSortedCredsTemp);
  }, [sortedCreds, newCreds, confirmationStatus])

  return {
    confirmationStatus,
    credsThatWillBeOverwritten,
    mergedSortedCreds,
    onConfirmOverwrite,
    onDenyOverwrite,
  }
}

export function useStoreCredentialsState({ searchParams, setCredsForAddLeaf }) {
  const [error, setError] = useState();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success'
  const { sortedCreds, loadingCreds } = useCreds();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();
  const { newCreds } = useRetrieveNewCredentials({ 
    setError,
    retrievalEndpoint: window.atob(searchParams.get('retrievalEndpoint')),
  });
  const { newCredsWithNewSecret } = useAddNewSecret({ 
    retrievalEndpoint: window.atob(searchParams.get('retrievalEndpoint')), 
    newCreds
  });
  const {
    confirmationStatus,
    credsThatWillBeOverwritten,
    mergedSortedCreds,
    onConfirmOverwrite,
    onDenyOverwrite,
  } = useMergeCreds({ 
    setError,
    sortedCreds: sortedCreds ?? {}, 
    loadingCreds, 
    newCreds: newCredsWithNewSecret 
  });

  useEffect(() => {
    if (confirmationStatus === 'confirmed' && mergedSortedCreds && newCreds?.creds?.issuerAddress) {
      // Store creds. Encrypt with AES, using holoKeyGenSigDigest as the key.
      const encryptedCredentialsAES = encryptWithAES(mergedSortedCreds, holoKeyGenSigDigest);
      // Storing creds in localStorage at multiple points allows us to restore them in case of a (potentially immediate) re-render
      // window.localStorage.setItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`, JSON.stringify(newCreds))
      setLocalUserCredentials(encryptedCredentialsAES);
      console.log('useStoreCredentialsState: calling setCredsForAddLeaf(mergedSortedCreds[newCreds.creds.issuerAddress])', Object.assign({}, mergedSortedCreds[newCreds.creds.issuerAddress]))
      setCredsForAddLeaf(mergedSortedCreds[newCreds.creds.issuerAddress]);
      setStatus('success');
    }
  }, [confirmationStatus, mergedSortedCreds])

  return {
    error,
    status,
    confirmationStatus,
    credsThatWillBeOverwritten,
    onConfirmOverwrite,
    onDenyOverwrite,
  }
}

export function useAddLeafState({ onSuccess }) {
  const [error, setError] = useState();
  const [status, setStatus] = useState('idle');
  const [credsForAddLeaf, setCredsForAddLeaf] = useState();
  const [readyToSendToServer, setReadyToSendToServer] = useState(false);
  const { reloadCreds, storeCreds } = useCreds();
  const { loadKOLPProof, kolpProof, loadProofs } = useProofs();

  async function sendCredsToServer() {
    const sortedCredsTemp = await reloadCreds();
    const success = await storeCreds(sortedCredsTemp, kolpProof);
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
    await Relayer.addLeaf(
      circomProof, 
      async () => {
        console.log('useAddLeafState: Added leaf')
        setStatus('generatingKOLPProof')
        loadKOLPProof(false, false, credsForAddLeaf.creds.newSecret, credsForAddLeaf.creds.serializedAsNewPreimage)
        setReadyToSendToServer(true);
      }, 
      () => {
        setError('Error: An error occurred while adding leaf to Merkle tree.')
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
    setStatus('backingUpCreds')
    sendCredsToServer()
      .then(() => {
        onSuccess()
        console.log('Sent creds to server. Now suggesting a reload of all proofs');
        loadProofs(true); // force a reload of all proofs since a new leaf has been added
      });
  }, [kolpProof, readyToSendToServer])
  
  return {
    error,
    status,
    setCredsForAddLeaf,
  };
}

const FinalStep = ({ onSuccess }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    error: addLeafError, 
    status: addLeafStatus, 
    setCredsForAddLeaf, 
  } = useAddLeafState({ onSuccess });
  const {
    error: storeCredsError,
    status: storeCredsStatus,
    confirmationStatus,
    credsThatWillBeOverwritten,
    onConfirmOverwrite,
    onDenyOverwrite,
  } = useStoreCredentialsState({ searchParams, setCredsForAddLeaf });
  const error = useMemo(
    () => addLeafError ?? storeCredsError, 
    [addLeafError, storeCredsError]
  );
  // TODO: Display these messages in a nice progress bar. Maybe in the big progress bar?
  const loadingMessage = useMemo(() => {
    if (storeCredsStatus === 'loading') return 'Loading credentials';
    else if (storeCredsStatus === 'success' && addLeafStatus === 'idle') return 'Adding leaf to Merkle tree';
    else if (addLeafStatus === 'generatingKOLPProof') return 'Generating proof';
    else if (addLeafStatus === 'backingUpCreds') return 'Backing up encrypted credentials';
  }, [storeCredsStatus, addLeafStatus])

  return (
    <>
      <Modal 
        // visible={confirmationModalVisible} 
        visible={confirmationStatus === 'confirmationRequired'}
        setVisible={() => {}} blur={true} heavyBlur={false} transparentBackground={false} >
        <div style={{ textAlign: 'center' }}>
          <p>You already have credentials from this issuer.</p>
          <p>Would you like to overwrite them?</p>
          <div className="confirmation-modal-buttons" style={{ marginTop: "10px", marginBottom: "10px", marginLeft: "auto", marginRight: "auto" }}>
            <button className="confirmation-modal-button-cancel" onClick={onDenyOverwrite}>No</button>
            <button className="confirmation-modal-button-confirm" onClick={onConfirmOverwrite}>Yes</button>
          </div>
          <p>You will not be able to undo this action.</p>
          <p>You would be overwriting...</p>
        </div>
          {JSON.stringify(credsThatWillBeOverwritten?.metadata?.rawCreds ?? credsThatWillBeOverwritten, null, 2)
            ?.replaceAll('}', '')?.replaceAll('{', '')?.replaceAll('"', '')?.split(',')?.map((cred, index) => (
              <p key={index}><code>{cred}</code></p>
          ))}
      </Modal>
      {confirmationStatus === 'denied' ? ( // declinedToStoreCreds ? (
        <>
          <h3>Verification finalization aborted</h3>
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
