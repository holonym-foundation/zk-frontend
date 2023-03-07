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

async function loadAntiSybil(
	newSecret, 
	serializedAsNewPreimage,
	address,
	actionId,
) {
	// TODO: Move this prep code into the `antiSybil` function
	console.log("actionId", actionId);
	const footprint = await poseidonTwoInputs([
		actionId,
		ethers.BigNumber.from(newSecret).toString(),
	]);
	const [
		issuer_,
		// eslint-disable-next-line no-unused-vars
		_,
		countryCode_,
		nameCitySubdivisionZipStreetHash_,
		completedAt_,
		scope,
	] = serializedAsNewPreimage;
	return await antiSybil(
		address,
		issuer_,
		actionId,
		footprint,
		countryCode_,
		nameCitySubdivisionZipStreetHash_,
		completedAt_,
		scope,
		newSecret,
	);
}

async function loadPoR(newSecret, serializedAsNewPreimage, userAddress) {
	// TODO: Move this prep code into the `proofOfResidency` function
	const salt =
		"18450029681611047275023442534946896643130395402313725026917000686233641593164"; // this number is poseidon("IsFromUS")
	const footprint = await poseidonTwoInputs([
		salt,
		ethers.BigNumber.from(newSecret).toString(),
	]);
	const [
		issuer_,
		// eslint-disable-next-line no-unused-vars
		_,
		countryCode_,
		nameCitySubdivisionZipStreetHash_,
		completedAt_,
		scope,
	] = serializedAsNewPreimage;
	return await proofOfResidency(
		userAddress,
		issuer_,
		salt,
		footprint,
		countryCode_,
		nameCitySubdivisionZipStreetHash_,
		completedAt_,
		scope,
		newSecret,
	);
}

async function loadMedicalSpecialtyProof(newSecret, serializedAsNewPreimage, userAddress) {
	// TODO: Move this prep code into the `proofOfMedicalSpecialty` function
	const salt =
		"320192098064396900878317978103229380372186908085604549333845693700248653086"; // this number is poseidon("MedicalSpecialty")
	const hashbrowns = await poseidonTwoInputs([
		salt,
		ethers.BigNumber.from(newSecret).toString(),
	]);
	const [
		issuer_,
		// eslint-disable-next-line no-unused-vars
		_,
		specialty,
		npiNumLicenseMedCredsHash,
		iat,
		scope,
	] = serializedAsNewPreimage;
	return await proofOfMedicalSpecialty(
		userAddress,
		issuer_,
		salt,
		hashbrowns,
		specialty,
		npiNumLicenseMedCredsHash,
		iat,
		scope,
		newSecret,
	);
}

// TODO: Low priority: Refactor this to have less duplicated code.
onmessage = async (event) => {
	await waitForArtifacts('poseidonQuinary', 10 * 1000)
	await waitForArtifacts('poseidonTwoInputs', 10 * 1000)
  if (event.data && event.data.message === "uniqueness") {
		try {
			if (generatingProof['uniqueness']) return;
			generatingProof['uniqueness'] = true;
			console.log('[Worker] Generating uniqueness proof. Received params:', event.data)
			const antiSybilProof = await loadAntiSybil(
				event.data.newSecret,
				event.data.serializedAsNewPreimage,
				event.data.userAddress,
				event.data.actionId,
			)
			postMessage({ error: null, proofType: "uniqueness", proof: antiSybilProof });
		} catch (err) {
			console.log('[Worker] Error generating uniqueness proof', err)
			generatingProof['uniqueness'] = false;
			postMessage({ error: err, proofType: "uniqueness", proof: null });
		}
  } else if (event.data && event.data.message === "us-residency") {
		try {
			if (generatingProof['us-residency']) return;	
			generatingProof['us-residency'] = true;
			console.log('[Worker] Generating us-residency proof. Params:', event.data)
			const proofOfResidencyProof = await loadPoR(
				event.data.newSecret,
				event.data.serializedAsNewPreimage,
				event.data.userAddress,
			)
			postMessage({ error: null, proofType: "us-residency", proof: proofOfResidencyProof });
		} catch (err) {
			console.log('[Worker] Error generating us-residency proof', err)
			generatingProof['us-residency'] = false;
			postMessage({ error: err, proofType: "us-residency", proof: null })
		}
  } else if (event.data && event.data.message === "medical-specialty") {
		try {
			if (generatingProof['medical-specialty']) return;	
			generatingProof['medical-specialty'] = true;
			console.log('[Worker] Generating medical-specialty proof. Params:', event.data)
			const medicalSpecialtyProof = await loadMedicalSpecialtyProof(
				event.data.newSecret,
				event.data.serializedAsNewPreimage,
				event.data.userAddress,
			)
			generatingProof['medical-specialty'] = false;
			postMessage({ error: null, proofType: "medical-specialty", proof: medicalSpecialtyProof });
		} catch (err) {
			console.log('[Worker] Error generating medical-specialty proof', err)
			generatingProof['medical-specialty'] = false;
			postMessage({ error: err, proofType: "medical-specialty", proof: null })
		}
  } else if (event.data && event.data.message === "gov-id-firstname-lastname") {
		try {
			if (generatingProof['gov-id-firstname-lastname']) return;	
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
			if (generatingProof['kolp']) return;	
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
