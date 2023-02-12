import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useAccount, useQuery } from "wagmi";
import { getCredentials, addProofMetadataItem } from "../../utils/secrets";
import {
	poseidonTwoInputs,
	proofOfResidency,
	antiSybil,
} from "../../utils/proofs";
import {
	serverAddress,
	defaultActionId,
	defaultChainToProveOn,
} from "../../constants";
// import residencyStoreABI from "../constants/abi/zk-contracts/ResidencyStore.json";
// import antiSybilStoreABI from "../constants/abi/zk-contracts/AntiSybilStore.json";
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";
import Relayer from "../../utils/relayer";

async function loadAntiSybil(newSecret, serializedAsNewPreimage,
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

async function loadPoR(newSecret, serializedAsNewPreimage, address) {
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
		address,
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

const MINTING_ERROR_TYPE = "mint";
const NOGOV_ERROR_TYPE = "no-idgov";
const LOAD_PROOF_TYPE = 'loadProof';
const SUBMIT_PROOF = 'submitProof';

const useProofsState = () => {
	const params = useParams();
  const navigate = useNavigate();
	const [sortedCreds, setSortedCreds] = useState();
	const [error, setError] = useState();
	const [customError, setCustomError] = useState();
	const [proof, setProof] = useState();
	const [submissionConsent, setSubmissionConsent] = useState(false);
  const [proofSubmissionSuccess, setProofSubmissionSuccess] = useState(false);
	const { data: account } = useAccount();
	const { holoAuthSigDigest } = useHoloAuthSig();
	const { holoKeyGenSigDigest } = useHoloKeyGenSig();
	const accountReadyAddress = useMemo(
		() => account?.connector.ready && account?.address && account.address,
    [account]
	);

	const proofs = {
		"us-residency": {
			name: "US Residency",
			// contractName: "IsUSResident",
			contractName: "IsUSResidentV2",
		},
		uniqueness: {
			name: "Uniqueness",
			// contractName: "SybilResistance",
			contractName: "SybilResistanceV2",
		},
	};

	// Steps:
	// 1. Get & set creds
	// 2. Get & set proof
	// 3. Submit proof tx

  // eslint-disable-next-line no-unused-vars
	const getCredentialsQuery = useQuery(
		["getCredentials", `${holoKeyGenSigDigest}${holoAuthSigDigest}`],
		() => getCredentials(holoKeyGenSigDigest, holoAuthSigDigest),
		{
			onSuccess: (sortedCredsTemp) => {
				if (sortedCredsTemp) {
					setSortedCreds(sortedCredsTemp);
				} else {
					setError({
						type: MINTING_ERROR_TYPE,
						message:
							"Could not retrieve credentials for proof. Please make sure you have minted your Holo.",
					});
				}
			},
			onError: (error) => {
        setError({
          type: MINTING_ERROR_TYPE,
          message: String(error)
        })
      },
			enabled: !!accountReadyAddress,
		},
	);

  // eslint-disable-next-line no-unused-vars
	const loadProofQuery = useQuery(
		["loadProof"],
		async () => {
			const creds = sortedCreds[serverAddress["idgov-v2"]];
			if (!creds) {
				throw new Error({
          type: NOGOV_ERROR_TYPE
        });
			}
			console.log("Loading proof");
			if (params.proofType === "us-residency") {
				return loadPoR(creds.creds.newSecret, creds.creds.serializedAsNewPreimage, accountReadyAddress);
			} else if (params.proofType === "uniqueness") {
				if (!params.actionId)
					console.error(`Warning: no actionId was given, using default of ${defaultActionId} (generic cross-action sybil resistance)`);
				return loadAntiSybil(
					creds.creds.newSecret,
					creds.creds.serializedAsNewPreimage,
					accountReadyAddress,
					params.actionId || defaultActionId,
				);
			}
		},
		{
			enabled: !!accountReadyAddress && !!sortedCreds && params.proofType in proofs,
			onError: (error) => {
				if ("type" in error && error.type === NOGOV_ERROR_TYPE) {
					setCustomError(
						<p>
							To do this proof, your Holo must have government ID credentials. Please{" "}
							<a 
                href="/mint/idgov" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate(e.target.href.replace(e.target.origin, ''));
                }} 
                style={{ color: "#fdc094" }}
              >
								add government ID credentials to your holo.
							</a>
						</p>
					);
				} else {
					setError({
            type: LOAD_PROOF_TYPE,
            message: String(error)
          });
				}
			},
			onSuccess: (data) => {
				setProof(data);
			},
		},
	);

	const submitProofThenStoreMetadataQuery = useQuery(
		["submitProofThenStoreMetadata"],
		async () => {
      const result = await Relayer.prove(
        proof,
				proofs[params.proofType].contractName,
        defaultChainToProveOn,
      );
      await addProofMetadataItem(
        result,
        proof.inputs[1],
				params.proofType,
				params.actionId,
        holoAuthSigDigest,
        holoKeyGenSigDigest,
      );
      return result;
    },
		{
			enabled: !!(submissionConsent && sortedCreds && proof),
			onSuccess: (result) => {
        console.log('result from submitProofThenStoreMetadata')
        console.log(result)
				if (result.error) {
					console.log("error", result);
					setError({
            type: SUBMIT_PROOF,
            message: result?.error?.response?.data?.error?.reason ??
            result?.error?.message,
          });
				} else {
          setProofSubmissionSuccess(true);
        }
			},
			onError: (error) => {
				console.log("error", error);
				setError({
					type: SUBMIT_PROOF,
					message: error?.response?.data?.error?.reason ?? error?.message,
				});
			}
		},
	);

  return {
    params,
    proofs,
    accountReadyAddress,
    sortedCreds,
    proof,
    submissionConsent,
    setSubmissionConsent,
    submitProofThenStoreMetadataQuery,
    proofSubmissionSuccess,
    error,
    customError,
  }
};

export default useProofsState;
