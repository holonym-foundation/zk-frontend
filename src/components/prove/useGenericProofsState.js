/**
 * Hook for managing state common to onChainProofs and offChainProofs.
 */
import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { serverAddress } from "../../constants";
import { useProofs } from "../../context/Proofs";
import { useProofMetadata } from "../../context/ProofMetadata";
import { useCreds } from "../../context/Creds";
import { datadogLogs } from '@datadog/browser-logs'

console.log('init logs')
datadogLogs.init({
  clientToken: 'pub2cce359232414eef33d1f9be6c2e4989',
  site: 'us5.datadoghq.com',
  forwardErrorsToLogs: true,
	forwardConsoleLogs: ["warning", "error"],
  sessionSampleRate: 100,
});

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
		loadingUniquenessProof,
		uniquenessPhoneProof,
		loadingUniquenessPhoneProof,
		usResidencyProof,
		loadingUSResidencyProof,
		medicalSpecialtyProof,
		loadingMedicalSpecialtyProof,
	} = useProofs();
	const { proofMetadata } = useProofMetadata();
	const accountReadyAddress = useMemo(
		() => account?.connector?.ready && account?.address && account.address,
    [account]
	);
	const alreadyHasSBT = useMemo(
		() => proofMetadata.filter((item) => item.proofType === params.proofType).length > 0,
		[proofMetadata, params.proofType]
	);
	const hasNecessaryCreds = useMemo(() => {
		if (params.proofType === "us-residency" || params.proofType === "uniqueness") {
			return !!sortedCreds?.[serverAddress['idgov-v2']]?.creds;
		} else if (params.proofType === "uniqueness-phone") {
			return !!sortedCreds?.[serverAddress['phone-v2']]?.creds;
		} else if (params.proofType === "medical-specialty") {
			return !!sortedCreds?.[serverAddress['med']]?.creds;
		}
	}, [sortedCreds, params.proofType])

	const proofs = {
		"us-residency": {
			name: "US Residency",
			// contractName: "IsUSResident",
			contractName: "IsUSResidentV2",
		},
		uniqueness: {
			name: "Uniqueness (government ID)",
			// contractName: "SybilResistance",
			contractName: "SybilResistanceV2",
		},
		'uniqueness-phone': {
			name: "Uniqueness (phone number)",
			contractName: "SybilResistancePhone",
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
			} else if (!(usResidencyProof || alreadyHasSBT)) {
				// loadUSResidencyProof(true);
			} else {
				setProof(usResidencyProof)
			}
		} else if (params.proofType === "uniqueness") {
			if (loadingUniquenessProof) {
				setProof(null);
			} else if (!(uniquenessProof || alreadyHasSBT)) {
				// loadUniquenessProof(true);
			} else {
				setProof(uniquenessProof)
			}
		} else if (params.proofType === "uniqueness-phone") {
			if (loadingUniquenessPhoneProof) {
				setProof(null);
			} else if (!(uniquenessPhoneProof || alreadyHasSBT)) {
				// loadUniquenessPhoneProof(true);
			} else {
				setProof(uniquenessPhoneProof)
			}
		} else if (params.proofType === "medical-specialty") {
			if (loadingMedicalSpecialtyProof) {
				setProof(null);
			} else if (!(medicalSpecialtyProof || alreadyHasSBT)) {
				// loadMedicalSpecialtyProof(true);
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
		uniquenessPhoneProof,
		loadingUniquenessPhoneProof,
		usResidencyProof,
		loadingUSResidencyProof,
		medicalSpecialtyProof,
		loadingMedicalSpecialtyProof
	])

	useEffect(() => {
		datadogLogs.logger.info('Proof submission error', { msg: error })

	}, [error])

  return {
    params,
    proofs,
		alreadyHasSBT,
    accountReadyAddress,
    hasNecessaryCreds,
    proof,
    submissionConsent,
    setSubmissionConsent,
    proofSubmissionSuccess,
		setProofSubmissionSuccess,
    error,
		setError,
  }
};

export default useProofsState;
