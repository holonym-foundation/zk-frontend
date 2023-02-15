/**
 * This web worker allows us to load the proofs in the background
 * without blocking the main thread. Loading proofs in the background
 * allows us to load proofs before the user navigates to the proof
 * page, which in turn decreases the time the user spends waiting for
 * a proof to load.
 */
import { ethers } from "ethers";
import {
	poseidonTwoInputs,
	proofOfResidency,
	antiSybil,
} from "../utils/proofs";

let generatingProof = {
	'uniqueness': false,
	'us-residency': false,
}

async function loadAntiSybil(
	newSecret, 
	serializedAsNewPreimage,
	address,
	actionId,
) {
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

onmessage = async (event) => {
  console.log('[Worker] event.data:', event.data)
  if (event.data && event.data.message === "uniqueness") {
		try {
			if (generatingProof['uniqueness']) return;
			generatingProof['uniqueness'] = true;
			const antiSybilProof = await loadAntiSybil(
				event.data.newSecret,
				event.data.serializedAsNewPreimage,
				event.data.userAddress,
				event.data.actionId,
			)
			generatingProof['uniqueness'] = false;
			postMessage({ error: null, proofType: "uniqueness", proof: antiSybilProof });
		} catch (err) {
			console.log('[Worker] Error generating uniqueness proof', err)
		}
  } else if (event.data && event.data.message === "us-residency") {
		try {
			if (generatingProof['us-residency']) return;	
			generatingProof['us-residency'] = true;
			const proofOfResidencyProof = await loadPoR(
				event.data.newSecret,
				event.data.serializedAsNewPreimage,
				event.data.userAddress,
			)
			generatingProof['us-residency'] = false;
			postMessage({ error: null, proofType: "us-residency", proof: proofOfResidencyProof});
		} catch (err) {
			console.log('[Worker] Error generating us-residency proof', err)
		}
  } else {
    postMessage({ error: "Unknown message", proofType: null, proof: null });
  }
}
