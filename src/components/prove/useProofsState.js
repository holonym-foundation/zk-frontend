import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useQuery } from "wagmi";
import {
	defaultChainToProveOn,
} from "../../constants";
// import residencyStoreABI from "../constants/abi/zk-contracts/ResidencyStore.json";
// import antiSybilStoreABI from "../constants/abi/zk-contracts/AntiSybilStore.json";
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";
import { useProofs } from "../../context/Proofs";
import { useProofMetadata } from "../../context/ProofMetadata";
import { useCreds } from "../../context/Creds";
import Relayer from "../../utils/relayer";

const MINTING_ERROR_TYPE = "mint";
const SUBMIT_PROOF = 'submitProof';

const useProofsState = () => {
	const params = useParams();
	const [error, setError] = useState();
	const [proof, setProof] = useState();
	const [submissionConsent, setSubmissionConsent] = useState(false);
  const [proofSubmissionSuccess, setProofSubmissionSuccess] = useState(false);
	const { data: account } = useAccount();
	const { holoAuthSigDigest } = useHoloAuthSig();
	const { holoKeyGenSigDigest } = useHoloKeyGenSig();
	const { sortedCreds, loadingCreds } = useCreds();
	const { 
		uniquenessProof,
		loadUniquenessProof,
		usResidencyProof,
		loadUSResidencyProof,
		medicalSpecialtyProof,
		loadMedicalSpecialtyProof
	} = useProofs();
	const { proofMetadata, addProofMetadataItem } = useProofMetadata();
	const accountReadyAddress = useMemo(
		() => account?.connector.ready && account?.address && account.address,
    [account]
	);
	const alreadyHasSBT = useMemo(
		() => proofMetadata.filter((item) => item.proofType === params.proofType).length > 0,
		[proofMetadata, params.proofType]
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
		"medical-specialty": {
			name: "Medical Specialty",
			contractName: "MedicalSpecialty",
		},
	};

	// Steps:
	// 1. Get & set creds
	// 2. Get & set proof
	// 3. Submit proof tx

	useEffect(() => {
		if (params.proofType === "us-residency") {
			if (!usResidencyProof) {
				// loadUSResidencyProof();
			} else {
				setProof(usResidencyProof)
			}
		} else if (params.proofType === "uniqueness") {
			if (!uniquenessProof) {
				// loadUniquenessProof();
			} else {
				setProof(uniquenessProof)
			}
		} else if (params.proofType === "medical-specialty") {
			if (!medicalSpecialtyProof) {
				// loadMedicalSpecialtyProof();
			} else {
				setProof(medicalSpecialtyProof)
			}
		}
	}, [uniquenessProof, usResidencyProof, medicalSpecialtyProof])

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
		alreadyHasSBT,
    accountReadyAddress,
    sortedCreds,
    proof,
    submissionConsent,
    setSubmissionConsent,
    submitProofThenStoreMetadataQuery,
    proofSubmissionSuccess,
    error,
  }
};

export default useProofsState;
