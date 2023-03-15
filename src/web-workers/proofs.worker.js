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
	uniquenessPhone,
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

async function loadProof(proofFunction, args, proofType, forceReload) {
	if (generatingProof[proofType] && !forceReload) return;
	try {
		generatingProof[proofType] = true;
		console.log(`[Worker] Generating ${proofType} proof. Received params:`, args)
		const antiSybilProof = await proofFunction(...args);
		postMessage({ error: null, proofType, proof: antiSybilProof });
	} catch (err) {
		console.log(`[Worker] Error generating ${proofType} proof`, err)
		postMessage({ error: err, proofType, proof: null });
	} finally {
		generatingProof[proofType] = false;
	}
}

onmessage = async (event) => {
	await waitForArtifacts('poseidonQuinary', 10 * 1000);
	await waitForArtifacts('poseidonTwoInputs', 10 * 1000);
  if (event.data && event.data.message === "uniqueness") {
		const args = [
			event.data.userAddress,
			event.data.govIdCreds,
			event.data.actionId,
		];
		loadProof(antiSybil, args, 'uniqueness', event.data.forceReload);
  } else if (event.data && event.data.message === "uniqueness-phone") {
		const args = [event.data.userAddress, event.data.phoneNumCreds, event.data.actionId];
		loadProof(uniquenessPhone, args, 'uniqueness-phone', event.data.forceReload);
  } else if (event.data && event.data.message === "us-residency") {
		const args = [event.data.userAddress, event.data.govIdCreds];
		loadProof(proofOfResidency, args, 'us-residency', event.data.forceReload);
  } else if (event.data && event.data.message === "medical-specialty") {
		const args = [event.data.userAddress, event.data.medicalCreds];
		loadProof(proofOfMedicalSpecialty, args, 'medical-specialty', event.data.forceReload);
  } else if (event.data && event.data.message === "gov-id-firstname-lastname") {
		const args = [event.data.govIdCreds];
		loadProof(proveGovIdFirstNameLastName, args, 'gov-id-firstname-lastname', event.data.forceReload);
  } else if (event.data && event.data.message === "kolp") {
		const args = [event.data.serializedAsNewPreimage, event.data.newSecret];
		loadProof(proveKnowledgeOfLeafPreimage, args, 'kolp', event.data.forceReload);
  } else {
    postMessage({ error: "Unknown message", proofType: null, proof: null });
  }
}
