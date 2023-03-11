/**
 * This provider generates proofs and stores them in context and session storage.
 * NOTE: This provider must be a child of the signature providers because this
 * provider relies on the user's signatures.
 */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { isEqual } from 'lodash';
import { ethers } from "ethers";
import { useAccount } from 'wagmi';
import Relayer from '../utils/relayer';
import { sha1String } from '../utils/misc';
import {
  onAddLeafProof,
	waitForArtifacts,
	poseidonTwoInputs,
	proofOfResidency,
	antiSybil,
	proofOfMedicalSpecialty,
	proveGovIdFirstNameLastName,
	proveKnowledgeOfLeafPreimage
} from "../utils/proofs";
import { serverAddress, defaultActionId } from '../constants';
import { useProofMetadata } from './ProofMetadata';
import ProofsWorker from "../web-workers/proofs.worker.js"; // Use worker in Webpack 4
import { useCreds } from './Creds';

const Proofs = createContext(null);

// Use worker in Webpack 5
// const proofsWorker = window.Worker ? new Worker(new URL('../web-workers/load-proofs.js', import.meta.url)) : null;

// Use worker in Webpack 4
const proofsWorker = new ProofsWorker();

function ProofsProvider({ children }) {
  const [uniquenessProof, setUniquenessProof] = useState(null);
  const [loadingUniquenessProof, setLoadingUniquenessProof] = useState(false);
  const [usResidencyProof, setUSResidencyProof] = useState(null);
  const [loadingUSResidencyProof, setLoadingUSResidencyProof] = useState(false);
  const [medicalSpecialtyProof, setMedicalSpecialtyProof] = useState(null);
  const [loadingMedicalSpecialtyProof, setLoadingMedicalSpecialtyProof] = useState(false);
  const [govIdFirstNameLastNameProof, setGovIdFirstNameLastNameProof] = useState(null);
  const [loadingGovIdFirstNameLastNameProof, setLoadingGovIdFirstNameLastNameProof] = useState(false);
  const [kolpProof, setKOLPProof] = useState(null);
  const [loadingKOLPProof, setLoadingKOLPProof] = useState(false);
  // const [disableLoadProofs, setDisableLoadProofs] = useState(false);
  const [sortedCredsDigest, setSortedCredsDigest] = useState(null);
  const { data: account } = useAccount();
  const { proofMetadata, loadingProofMetadata } = useProofMetadata();
  const { sortedCreds, loadingCreds, storeCreds } = useCreds();
  const prevSortedCredsRef = useRef(sortedCreds);

  // TODO: Load all proofs in here. Need to add onAddLeafProof

  /**
   * @param {boolean} suggestForceReload - If true, proofs will be reloaded even if they are already loaded
   * and even if they are currently being loaded UNLESS sortedCreds is the same as it was the last time
   * this function was called.
   */
  async function loadProofs(suggestForceReload = false) {
    if (loadingProofMetadata || loadingCreds || !sortedCreds) return;
    if (sortedCredsDigest && sortedCredsDigest === await sha1String(JSON.stringify(sortedCreds))) {
      console.log('Denying a reload of proofs because sortedCredsDigest is the same', sortedCredsDigest);
      return;
    }
    setSortedCredsDigest(await sha1String(JSON.stringify(sortedCreds)));
    console.log('Loading proofs. suggestForceReload:', suggestForceReload)
    // Figure out which proofs the user doesn't already have. Then load them
    // if the user has the credentials to do so.
    const missingProofs = { 
      'uniqueness': !uniquenessProof,
      'us-residency': !usResidencyProof, 
      'medical-specialty': !medicalSpecialtyProof,
      'gov-id-firstname-lastname': !govIdFirstNameLastNameProof, // Not an SBT. No good way to determine whether user needs it, so always generate
      'kolp': !kolpProof, // Not an SBT. Always needed
    };
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
    console.log('creds', sortedCreds)
    if (!sortedCreds) return;

    if (suggestForceReload || (missingProofs.kolp && !loadingKOLPProof)) {
      setLoadingKOLPProof(true);
      loadKOLPProof(false, suggestForceReload);
    }
    if (suggestForceReload || (missingProofs.uniqueness && !loadingUniquenessProof)) {
      setLoadingUniquenessProof(true);
      loadUniquenessProof(false, suggestForceReload);
    }
    if (suggestForceReload || (missingProofs['us-residency'] && !loadingUSResidencyProof)) {
      setLoadingUSResidencyProof(true);
      loadUSResidencyProof(false, suggestForceReload);
    }
    if (suggestForceReload || (missingProofs['gov-id-firstname-lastname'] && !loadingGovIdFirstNameLastNameProof)) {
      setLoadingGovIdFirstNameLastNameProof(true);
      loadGovIdFirstNameLastNameProof(false, suggestForceReload);
    }
    if (suggestForceReload || (missingProofs['medical-specialty'] && !loadingMedicalSpecialtyProof)) {
      setLoadingMedicalSpecialtyProof(true);
      loadMedicalSpecialtyProof(false, suggestForceReload);
    }
  }

  /**
   * @param creds An object from an issuer (not a sortedCreds object).
   */
  async function addLeaf(creds) {
    const circomProof = await onAddLeafProof(creds);
    await Relayer.addLeaf(
      circomProof, 
      async () => {
        // loadKOLPProof(creds.creds.newSecret, creds.creds.serializedAsNewPreimage)
        // We assume KOLPProof has been loaded.
        // TODO: Handle case where KOLPProof has not been loaded
        if (sortedCreds && kolpProof) storeCreds(sortedCreds, kolpProof);
      }, 
    );
  }
  
  /**
   * Load anti-sybil proof into context.
   * @param runInMainThread - Whether to generate the proof in the main thread. Prefer false because
   * running in main thread could result in the page freezing while proof is generating.
   */
  async function loadUniquenessProof(runInMainThread = false, forceReload = false) {
    const govIdCreds = sortedCreds?.[serverAddress['idgov-v2']]
    if (!govIdCreds) return;
    if (!runInMainThread && proofsWorker) {
      proofsWorker.postMessage({
        message: "uniqueness", 
        newSecret: govIdCreds.creds.newSecret, 
        serializedAsNewPreimage: govIdCreds.creds.serializedAsNewPreimage, 
        userAddress: account.address,
        actionId: defaultActionId,
        forceReload
      });
    } 
    if (runInMainThread) {
      try {
        // TODO: Move this prep code into the `antiSybil` function
        console.log("actionId", defaultActionId);
        const footprint = await poseidonTwoInputs([
          defaultActionId,
          ethers.BigNumber.from(govIdCreds.creds.newSecret).toString(),
        ]);
        const [
          issuer_,
          // eslint-disable-next-line no-unused-vars
          _,
          countryCode_,
          nameCitySubdivisionZipStreetHash_,
          completedAt_,
          scope,
        ] = govIdCreds.creds.serializedAsNewPreimage;
        const proof = await antiSybil(
          account.address,
          issuer_,
          defaultActionId,
          footprint,
          countryCode_,
          nameCitySubdivisionZipStreetHash_,
          completedAt_,
          scope,
          govIdCreds.creds.newSecret,
        );
        setUniquenessProof(proof);
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingUniquenessProof(false);
      }
    }
  }

  /**
   * Load proof of residency proof into context.
   * @param runInMainThread - Whether to generate the proof in the main thread. Prefer false because
   * running in main thread could result in the page freezing while proof is generating.
   */
  async function loadUSResidencyProof(runInMainThread = false, forceReload = false) {
    const govIdCreds = sortedCreds?.[serverAddress['idgov-v2']]
    if (!govIdCreds) return;
    if (proofsWorker && !runInMainThread) {
      proofsWorker.postMessage({ 
        message: "us-residency", 
        newSecret: govIdCreds.creds.newSecret, 
        serializedAsNewPreimage: govIdCreds.creds.serializedAsNewPreimage, 
        userAddress: account.address,
        forceReload
      });
    } 
    if (runInMainThread) {
      try {
        // TODO: Move this prep code into the `proofOfResidency` function
        const salt =
          "18450029681611047275023442534946896643130395402313725026917000686233641593164"; // this number is poseidon("IsFromUS")
        const footprint = await poseidonTwoInputs([
          salt,
          ethers.BigNumber.from(govIdCreds.creds.newSecret).toString(),
        ]);
        const [
          issuer_,
          // eslint-disable-next-line no-unused-vars
          _,
          countryCode_,
          nameCitySubdivisionZipStreetHash_,
          completedAt_,
          scope,
        ] = govIdCreds.creds.serializedAsNewPreimage;
        const proof = await proofOfResidency(
          account.address,
          issuer_,
          salt,
          footprint,
          countryCode_,
          nameCitySubdivisionZipStreetHash_,
          completedAt_,
          scope,
          govIdCreds.creds.newSecret,
        );
        setUSResidencyProof(proof);
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingUSResidencyProof(false);
      }
    }
  }

  /**
   * Load medical specialty proof into context.
   * @param runInMainThread - Whether to generate the proof in the main thread. Prefer false because
   * running in main thread could result in the page freezing while proof is generating.
   */
  async function loadMedicalSpecialtyProof(runInMainThread = false, forceReload = false) {
    const medicalCreds = sortedCreds?.[serverAddress['med']]
    if (!medicalCreds) return;
    if (proofsWorker && !runInMainThread) {
      proofsWorker.postMessage({
        message: "medical-specialty", 
        newSecret: medicalCreds.creds.newSecret, 
        serializedAsNewPreimage: medicalCreds.creds.serializedAsNewPreimage, 
        userAddress: account.address,
        forceReload
      });
    }
    if (runInMainThread) {
      try {
        // TODO: Move this prep code into the `proofOfMedicalSpecialty` function
        const salt =
          "320192098064396900878317978103229380372186908085604549333845693700248653086"; // this number is poseidon("MedicalSpecialty")
        const hashbrowns = await poseidonTwoInputs([
          salt,
          ethers.BigNumber.from(medicalCreds.creds.newSecret).toString(),
        ]);
        const [
          issuer_,
          // eslint-disable-next-line no-unused-vars
          _,
          specialty,
          npiNumLicenseMedCredsHash,
          iat,
          scope,
        ] = medicalCreds.creds.serializedAsNewPreimage;
        const proof = await proofOfMedicalSpecialty(
          account.address,
          issuer_,
          salt,
          hashbrowns,
          specialty,
          npiNumLicenseMedCredsHash,
          iat,
          scope,
          medicalCreds.creds.newSecret,
        );
        setMedicalSpecialtyProof(proof);
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingMedicalSpecialtyProof(false);
      }
    }
  }

  function loadGovIdFirstNameLastNameProof(runInMainThread = false, forceReload = false) {
    const govIdCreds = sortedCreds?.[serverAddress['idgov-v2']]
    if (!govIdCreds) return;
    if (proofsWorker && !runInMainThread) {
      proofsWorker.postMessage({ 
        message: "gov-id-firstname-lastname", 
        govIdCreds,
        forceReload,
      });
    }
    if (runInMainThread) {
      // TODO: Call the function directly
    }
  }

  function loadKOLPProof(runInMainThread = false, forceReload = false) {
    const govIdCreds = sortedCreds?.[serverAddress['idgov-v2']]
    const phoneNumCreds = sortedCreds[serverAddress['phone-v2']];
    if (!govIdCreds && !phoneNumCreds) return;
    if (proofsWorker && !runInMainThread) {
      // We just need one KOLP proof. The proof is only used by storage server to verify that
      // the request is in fact from a Holonym user.
      if (govIdCreds?.creds?.serializedAsNewPreimage) {
        proofsWorker.postMessage({ 
          message: "kolp", 
          newSecret: govIdCreds.creds.newSecret, 
          serializedAsNewPreimage: govIdCreds.creds.serializedAsNewPreimage,
          forceReload,
        });
      } else if (phoneNumCreds?.creds?.serializedAsNewPreimage) {
        proofsWorker.postMessage({ 
          message: "kolp", 
          newSecret: govIdCreds.creds.newSecret, 
          serializedAsNewPreimage: govIdCreds.creds.serializedAsNewPreimage,
          forceReload,
        });
      }
    } 
    if (runInMainThread) {
      // TODO: Call the function directly
    }
  }

  useEffect(() => {
    proofsWorker.onmessage = async (event) => {
      if (event?.data?.error) {
        console.error(event.data.error);
        // If proof failed because leaf isn't in tree, call addLeaf. This handles the case where the
        // user retrieved their credentials but something failed during the add leaf process.
        if (event.data.error?.message === "Leaf is not in Merkle tree") {
          if (event.data.proofType === "us-residency" || event.data.proofType === "uniqueness") {
            console.log('Attempting to add leaf for idgov-v2 creds')
            await addLeaf(sortedCreds[serverAddress['idgov-v2']])
            console.log('Attempted to add leaf for idgov-v2 creds');
          } else if (event.data.proofType === "medical-specialty") {
            console.log('Attempting to add leaf for med creds')
            await addLeaf(sortedCreds[serverAddress['med']])
            console.log('Attempted to add leaf for med creds');
          }
          // Reload proofs after adding leaf. The proof that erred should succeed now.
          loadProofs(true);
        }
      } else if (event?.data?.proofType === "us-residency") {
        setUSResidencyProof(event.data.proof);
        setLoadingUSResidencyProof(false);
      } else if (event?.data?.proofType === "uniqueness") {
        setUniquenessProof(event.data.proof);
        setLoadingUniquenessProof(false);
      } else if (event?.data?.proofType === "medical-specialty") {
        setMedicalSpecialtyProof(event.data.proof);
        setLoadingMedicalSpecialtyProof(false);
      } else if (event?.data?.proofType === "gov-id-firstname-lastname") {
        setGovIdFirstNameLastNameProof(event.data.proof);
        setLoadingGovIdFirstNameLastNameProof(false);
      } else if (event?.data?.proofType === "kolp") {
        setKOLPProof(event.data.proof);
        setLoadingKOLPProof(false);
      }
    };
    // Force a reload of the proofs if sortedCreds has actually changed. Otherwise just load
    // proofs that haven't yet been loaded.
    const forceReload = !isEqual(sortedCreds, prevSortedCredsRef.current)
    loadProofs(forceReload);

    prevSortedCredsRef.current = sortedCreds;
  }, [proofMetadata, loadingProofMetadata, sortedCreds, loadingCreds])

  return (
    <Proofs.Provider value={{
      uniquenessProof,
      loadUniquenessProof,
      loadingUniquenessProof,
      usResidencyProof,
      loadUSResidencyProof,
      loadingUSResidencyProof,
      medicalSpecialtyProof,
      loadMedicalSpecialtyProof,
      loadingMedicalSpecialtyProof,
      govIdFirstNameLastNameProof,
      loadGovIdFirstNameLastNameProof,
      loadingGovIdFirstNameLastNameProof,
      kolpProof,
      loadKOLPProof,
      loadingKOLPProof,
      loadProofs, // load all proofs
    }}>
      {children}
    </Proofs.Provider>
  )
}

// Helper hook to access the provider values
const useProofs = () => useContext(Proofs)

export { ProofsProvider, useProofs }
