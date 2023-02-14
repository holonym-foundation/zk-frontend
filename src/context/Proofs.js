/**
 * This provider generates proofs and stores them in context and session storage.
 * NOTE: This provider must be a child of the signature providers because this
 * provider relies on the user's signatures.
 */
import React, { createContext, useContext, useEffect } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { serverAddress } from '../constants';
import { getCredentials, getProofMetadata } from "../utils/secrets";
import { useHoloAuthSig } from './HoloAuthSig';
import { useHoloKeyGenSig } from './HoloKeyGenSig';

const Proofs = createContext(null);

const proofsWorker = window.Worker ? new Worker(new URL('../web-workers/load-proofs.js', import.meta.url)) : null;

function ProofsProvider({ children }) {
  const [uniquenessProof, setUniquenessProof] = useSessionStorage('uniqueness-proof', null)
  const [usResidencyProof, setUSResidencyProof] = useSessionStorage('us-residency-proof', null)
  const { holoAuthSigDigest } = useHoloAuthSig();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();

  // TODO: Load all proofs in here. Need to add onAddLeafProof and proofOfKnowledgeOfLeafPreimage

  useEffect(() => {
    proofsWorker.onmessage = (event) => {
      if (event?.data?.proofType === "us-residency") {
        setUSResidencyProof(event.data.proof);
      } else if (event?.data?.proofType === "uniqueness") {
        setUniquenessProof(event.data.proof);
      } else if (event?.data?.error) {
        console.error(event.data.error);
      }
    };
    // TODO: Use useQuery for this so that you only call this function once
    (async () => {
      // Figure out which proofs the user doesn't already have. Then load them
      // if the user has the credentials to do so.
      const missingProofs = { 'uniqueness': true, 'us-residency': true };
      const proofMetadata = await getProofMetadata(holoKeyGenSigDigest, holoAuthSigDigest);
      if (proofMetadata) {
        for (const proofMetadataItem of proofMetadata) {
          if (proofMetadataItem?.proofType === "us-residency") {
            missingProofs['us-residency'] = false;
          } else if (proofMetadataItem?.proofType === "uniqueness") {
            missingProofs['uniqueness'] = false;
          }
        }
      }
      // NOTE: Calling getCredentials with restore=true was causing issues. If the user
      // mints, and if this component renders at the same time that credentials are retrieved
      // and confirmed in store-credentials, then this call to getCredentials could result
      // in the newly (locally) stored creds to be overwritten by the old ones. So we set
      // restore to false here.
      const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, false);
      if (!sortedCreds) {
        return;
      }
      console.log('[PROOFS] sortedCreds:', sortedCreds)
      // Load proofs requiring gov ID creds
      const govIdCreds = sortedCreds[serverAddress['idgov-v2']]
      if (govIdCreds) {
        console.log('[PROOFS] govIdCreds exist')
        console.log('[PROOFS] missingProofs', missingProofs)
        if (missingProofs.uniqueness) {
          loadUniquenessProof(
            govIdCreds.creds.newSecret, 
            govIdCreds.creds.serializedAsNewPreimage, 
            govIdCreds.creds.issuerAddress, 
            "123456789"
          );
        }
        if (missingProofs['us-residency']) {
          console.log('govIdCreds right before calling loadUSResidencyProof', govIdCreds)
          loadUSResidencyProof(
            govIdCreds.creds.newSecret, 
            govIdCreds.creds.serializedAsNewPreimage, 
            govIdCreds.creds.issuerAddress, 
          );
        }
      }
    })();
  }, [])
  
  /**
   * Use web worker to load anti-sybil proof into context and session storage.
   */
  function loadUniquenessProof(newSecret, serializedAsNewPreimage, issuerAddress, actionId) {
    if (proofsWorker) {
      console.log('[Main] Main script requesting uniqueness proof from worker')
      proofsWorker.postMessage({ 
        message: "uniqueness", 
        newSecret, 
        serializedAsNewPreimage, 
        issuerAddress, 
        actionId
      });
    } else {
      // TODO: Call the function directly
    }
  }

  /**
   * Use web worker to load proof of residency proof into context and session storage.
   */
  function loadUSResidencyProof(newSecret, serializedAsNewPreimage, issuerAddress) {
    if (proofsWorker) {
      console.log('[Main] Main script requesting us-residency proof from worker')
      proofsWorker.postMessage({ 
        message: "us-residency", 
        newSecret, 
        serializedAsNewPreimage, 
        issuerAddress
      });
    } else {
      // TODO: Call the function directly
    }
  }

  return (
    <Proofs.Provider value={{
      uniquenessProof,
      loadUniquenessProof,
      usResidencyProof,
      loadUSResidencyProof
    }}>
      {children}
    </Proofs.Provider>
  )
}

// Helper hook to access the provider values
const useProofs = () => useContext(Proofs)

export { ProofsProvider, useProofs }
