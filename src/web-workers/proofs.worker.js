/**
 * This web worker allows us to load the proofs in the background
 * without blocking the main thread. Loading proofs in the background
 * allows us to load proofs before the user navigates to the proof
 * page, which in turn decreases the time the user spends waiting for
 * a proof to load.
 */
import { ethers } from "ethers";
import {
	waitForArtifacts,
	poseidonTwoInputs,
	proofOfResidency,
	antiSybil,
	proofOfMedicalSpecialty,
	proveGovIdFirstNameLastName,
	proveKnowledgeOfLeafPreimage
} from "../utils/proofs";

let generatingProof = {
	'uniqueness': false,
	'us-residency': false,
	'medical-specialty': false,
	'gov-id-firstname-lastname': false,
	'kolp': false, // == "Knowlege of Leaf Preimage"
}

// TODO: Low priority: Refactor this to have less duplicated code.
onmessage = async (event) => {
	await waitForArtifacts('poseidonQuinary', 10 * 1000)
	await waitForArtifacts('poseidonTwoInputs', 10 * 1000)
  if (event.data && event.data.message === "uniqueness") {
		try {
			if (generatingProof['uniqueness'] && !event.data.forceReload) return;
			generatingProof['uniqueness'] = true;
			console.log('[Worker] Generating uniqueness proof. Received params:', event.data)
			const antiSybilProof = await antiSybil(
				event.data.userAddress,
				event.data.govIdCreds,
				event.data.actionId,
			);
			postMessage({ error: null, proofType: "uniqueness", proof: antiSybilProof });
		} catch (err) {
			console.log('[Worker] Error generating uniqueness proof', err)
			generatingProof['uniqueness'] = false;
			postMessage({ error: err, proofType: "uniqueness", proof: null });
		}
  } else if (event.data && event.data.message === "us-residency") {
		try {
			if (generatingProof['us-residency'] && !event.data.forceReload) return;	
			generatingProof['us-residency'] = true;
			console.log('[Worker] Generating us-residency proof. Params:', event.data)
			const proofOfResidencyProof = await proofOfResidency(event.data.userAddress, event.data.govIdCreds);
			postMessage({ error: null, proofType: "us-residency", proof: proofOfResidencyProof });
		} catch (err) {
			console.log('[Worker] Error generating us-residency proof', err)
			generatingProof['us-residency'] = false;
			postMessage({ error: err, proofType: "us-residency", proof: null })
		}
  } else if (event.data && event.data.message === "medical-specialty") {
		try {
			if (generatingProof['medical-specialty'] && !event.data.forceReload) return;	
			generatingProof['medical-specialty'] = true;
			console.log('[Worker] Generating medical-specialty proof. Params:', event.data)
			const medicalSpecialtyProof = await proofOfMedicalSpecialty(
				event.data.userAddress,
				event.data.medicalCreds,
			);
			generatingProof['medical-specialty'] = false;
			postMessage({ error: null, proofType: "medical-specialty", proof: medicalSpecialtyProof });
		} catch (err) {
			console.log('[Worker] Error generating medical-specialty proof', err)
			generatingProof['medical-specialty'] = false;
			postMessage({ error: err, proofType: "medical-specialty", proof: null })
		}
  } else if (event.data && event.data.message === "gov-id-firstname-lastname") {
		try {
			if (generatingProof['gov-id-firstname-lastname'] && !event.data.forceReload) return;	
			generatingProof['gov-id-firstname-lastname'] = true;
			console.log('[Worker] Generating gov-id-firstname-lastname proof. Params:', event.data)
      const govIdFirstNameLastNameProof = await proveGovIdFirstNameLastName(event.data.govIdCreds);
			generatingProof['gov-id-firstname-lastname'] = false;
			postMessage({ error: null, proofType: "gov-id-firstname-lastname", proof: govIdFirstNameLastNameProof });
		} catch (err) {
			console.log('[Worker] Error generating gov-id-firstname-lastname proof', err)
			generatingProof['gov-id-firstname-lastname'] = false;
			postMessage({ error: err, proofType: "gov-id-firstname-lastname", proof: null })
		}
  } else if (event.data && event.data.message === "kolp") {
		try {
			if (generatingProof['kolp'] && !event.data.forceReload) return;	
			generatingProof['kolp'] = true;
			console.log('[Worker] Generating kolp proof. Params:', event.data)
			const kolpProof = await proveKnowledgeOfLeafPreimage(
				event.data.serializedAsNewPreimage, 
				event.data.newSecret
			);
			generatingProof['kolp'] = false;
			postMessage({ error: null, proofType: "kolp", proof: kolpProof});
		} catch (err) {
			console.log('[Worker] Error generating kolp proof', err)
			generatingProof['kolp'] = false;
			postMessage({ error: err, proofType: "kolp", proof: null })
		}
  } else {
    postMessage({ error: "Unknown message", proofType: null, proof: null });
  }
}
