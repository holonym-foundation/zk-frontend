import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useQuery } from "wagmi";
import {
	defaultChainToProveOn,
	serverAddress,
} from "../../constants";
// import residencyStoreABI from "../constants/abi/zk-contracts/ResidencyStore.json";
// import antiSybilStoreABI from "../constants/abi/zk-contracts/AntiSybilStore.json";
import { useProofs } from "../../context/Proofs";
import { useProofMetadata } from "../../context/ProofMetadata";
import { useCreds } from "../../context/Creds";
import Relayer from "../../utils/relayer";

const SUBMIT_PROOF = 'submitProof';

const useProofsState = () => {
	const params = useParams();
	const [error, setError] = useState();
	const [proof, setProof] = useState();
	const [submissionConsent, setSubmissionConsent] = useState(false);
  const [proofSubmissionSuccess, setProofSubmissionSuccess] = useState(false);
	const { data: account } = useAccount();
	const { sortedCreds } = useCreds();
	const { 
		uniquenessProof,
		loadUniquenessProof,
		loadingUniquenessProof,
		usResidencyProof,
		loadUSResidencyProof,
		loadingUSResidencyProof,
		medicalSpecialtyProof,
		loadMedicalSpecialtyProof,
		loadingMedicalSpecialtyProof,
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
	const hasNecessaryCreds = useMemo(() => {
		if (params.proofType === "us-residency" || params.proofType === "uniqueness") {
			return !!sortedCreds?.[serverAddress['idgov-v2']]?.creds;
		} else if (params.proofType === "medical-specialty") {
			return !!sortedCreds?.[serverAddress['med']]?.creds;
		}
	}, [sortedCreds])

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
			if (loadingUSResidencyProof) {
				// Set proof to null if proof is loading. This handles the case where a proof has already
				// been set in the state of this hook but proofs in context are being forced to reload.
				// Force reloads of proofs occur after adding a leaf to the Merkle tree.
				setProof(null);
			} else if (!usResidencyProof && !alreadyHasSBT) {
				loadUSResidencyProof(true);
			} else {
				setProof(usResidencyProof)
			}
		} else if (params.proofType === "uniqueness") {
			if (loadingUniquenessProof) {
				setProof(null);
			} else if (!uniquenessProof && !alreadyHasSBT) {
				loadUniquenessProof(true);
			} else {
				setProof(uniquenessProof)
			}
		} else if (params.proofType === "medical-specialty") {
			if (loadingMedicalSpecialtyProof) {
				setProof(null);
			} else if (!medicalSpecialtyProof && !alreadyHasSBT) {
				loadMedicalSpecialtyProof(true);
			} else {
				setProof(medicalSpecialtyProof)
			}
		}
	}, 
	// eslint-disable-next-line react-hooks/exhaustive-deps
	[
		params,
		uniquenessProof,
		loadingUniquenessProof,
		usResidencyProof,
		loadingUSResidencyProof,
		medicalSpecialtyProof,
		loadingMedicalSpecialtyProof
	])

	const submitProofQuery = useQuery(
		["submitProof"],
		async () => {
      return await Relayer.prove(
        proof,
				proofs[params.proofType].contractName,
        defaultChainToProveOn,
      );
    },
		{
			enabled: !!(submissionConsent && sortedCreds && proof),
			onSuccess: (result) => {
        console.log('result from submitProof')
        console.log(result)
				if (result.error) {
					console.log("error", result);
					setError({
            type: SUBMIT_PROOF,
            message: result?.error?.response?.data?.error?.reason ??
            result?.error?.message,
          });
				} else {
					addProofMetadataItem(
						result,
						proof.inputs[1],
						params.proofType,
						params.actionId,
					);
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
    hasNecessaryCreds,
    proof,
    submissionConsent,
    setSubmissionConsent,
    submitProofQuery,
    proofSubmissionSuccess,
    error,
  }
};

export default useProofsState;
