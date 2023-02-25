/**
 * This provider generates proofs and stores them in context and session storage.
 * NOTE: This provider must be a child of the signature providers because this
 * provider relies on the user's signatures.
 */
import React, { createContext, useContext, useEffect } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { useAccount } from 'wagmi';
import { serverAddress, defaultActionId } from '../constants';
import { getCredentials } from "../utils/secrets";
import { useHoloAuthSig } from './HoloAuthSig';
import { useHoloKeyGenSig } from './HoloKeyGenSig';
import { useProofMetadata } from './ProofMetadata';
import ProofsWorker from "../web-workers/proofs.worker.js"; // Use worker in Webpack 4

const Proofs = createContext(null);

// Use worker in Webpack 5
// const proofsWorker = window.Worker ? new Worker(new URL('../web-workers/load-proofs.js', import.meta.url)) : null;

// Use worker in Webpack 4
const proofsWorker = new ProofsWorker();

function ProofsProvider({ children }) {
  const [uniquenessProof, setUniquenessProof] = useSessionStorage('uniqueness-proof', null);
  const [usResidencyProof, setUSResidencyProof] = useSessionStorage('us-residency-proof', null);
  const [medicalSpecialtyProof, setMedicalSpecialtyProof] = useSessionStorage('medical-specialty-proof', null);
  const { data: account } = useAccount();
  const { holoAuthSigDigest } = useHoloAuthSig();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();
  const { proofMetadata, loadingProofMetadata } = useProofMetadata();

  // TODO: Load all proofs in here. Need to add onAddLeafProof and proofOfKnowledgeOfLeafPreimage

  useEffect(() => {
    proofsWorker.onmessage = (event) => {
      if (event?.data?.proofType === "us-residency") {
        setUSResidencyProof(event.data.proof);
      } else if (event?.data?.proofType === "uniqueness") {
        setUniquenessProof(event.data.proof);
      } else if (event?.data?.proofType === "medical-specialty") {
        console.log('medical-specialty proof', event.data.proof)
        setMedicalSpecialtyProof(event.data.proof);
      } else if (event?.data?.error) {
        console.error(event.data.error);
      }
    };

    if (loadingProofMetadata) return;

    // TODO: Use useQuery for this so that you only call this function once
    (async () => {
      // Figure out which proofs the user doesn't already have. Then load them
      // if the user has the credentials to do so.
      const missingProofs = { 'uniqueness': true, 'us-residency': true, 'medical-specialty': true };
      if (proofMetadata) {
        for (const proofMetadataItem of proofMetadata) {
          if (proofMetadataItem?.proofType === "us-residency") {
            missingProofs['us-residency'] = false;
          } else if (proofMetadataItem?.proofType === "uniqueness") {
            missingProofs['uniqueness'] = false;
          } else if (proofMetadataItem?.proofType === "medical-specialty") {
            missingProofs['medical-specialty'] = false;
          }
        }
      }
      // NOTE: Calling getCredentials with restore=true was causing issues. If the user
      // mints, and if this component renders at the same time that credentials are retrieved
      // and confirmed in store-credentials, then this call to getCredentials could result
      // in the newly (locally) stored creds to be overwritten by the old ones. So we set
      // restore to false here.
      const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, false);
      console.log('creds', sortedCreds)
      if (!sortedCreds) {
        return;
      }
      // Load proofs requiring gov ID creds
      const govIdCreds = sortedCreds[serverAddress['idgov-v2']]
      if (govIdCreds) {
        if (missingProofs.uniqueness) {
          loadUniquenessProof(
            govIdCreds.creds.newSecret, 
            govIdCreds.creds.serializedAsNewPreimage, 
            account.address,
            defaultActionId
          );
        }
        if (missingProofs['us-residency']) {
          loadUSResidencyProof(
            govIdCreds.creds.newSecret, 
            govIdCreds.creds.serializedAsNewPreimage, 
            account.address,
          );
        }
      }
      // Load proofs requiring medical creds
      const medicalCreds = sortedCreds[serverAddress['med']]
      if (medicalCreds) {
        if (missingProofs['medical-specialty']) {
          loadMedicalSpecialtyProof(
            govIdCreds.creds.newSecret, 
            govIdCreds.creds.serializedAsNewPreimage, 
            account.address,
          );
        }
      }
    })();
  }, [proofMetadata, loadingProofMetadata])
  
  /**
   * Use web worker to load anti-sybil proof into context and session storage.
   */
  function loadUniquenessProof(newSecret, serializedAsNewPreimage, userAddress, actionId) {
    if (proofsWorker) {
      console.log('Main script requesting uniqueness proof from worker')
      proofsWorker.postMessage({ 
        message: "uniqueness", 
        newSecret, 
        serializedAsNewPreimage, 
        userAddress, 
        actionId
      });
    } else {
      // TODO: Call the function directly
    }
  }

  /**
   * Use web worker to load proof of residency proof into context and session storage.
   */
  function loadUSResidencyProof(newSecret, serializedAsNewPreimage, userAddress) {
    if (proofsWorker) {
      console.log('Main script requesting us-residency proof from worker')
      proofsWorker.postMessage({ 
        message: "us-residency", 
        newSecret, 
        serializedAsNewPreimage, 
        userAddress
      });
    } else {
      // TODO: Call the function directly
    }
  }

  /**
   * Use web worker to load medical specialty proof into context and session storage.
   */
  function loadMedicalSpecialtyProof(newSecret, serializedAsNewPreimage, userAddress) {
    if (proofsWorker) {
      console.log('Main script requesting medical-specialty proof from worker')
      proofsWorker.postMessage({ 
        message: "medical-specialty", 
        newSecret, 
        serializedAsNewPreimage, 
        userAddress
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
      loadUSResidencyProof,
      medicalSpecialtyProof,
      loadMedicalSpecialtyProof
    }}>
      {children}
    </Proofs.Provider>
  )
}

// Helper hook to access the provider values
const useProofs = () => useContext(Proofs)

export { ProofsProvider, useProofs }
