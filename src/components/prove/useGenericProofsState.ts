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
import { datadogLogs } from "../../utils/datadog";

type CustomError = {
  type?: string;
  message?: string;
  balance?: string;
};

const useProofsState = () => {
  const params = useParams();
  const [error, setError] = useState<CustomError>();
  const [proof, setProof] = useState<any>();
  const [submissionConsent, setSubmissionConsent] = useState(false);
  const [proofSubmissionSuccess, setProofSubmissionSuccess] = useState(false);
  const account = useAccount();
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
  const accountReadyAddress = useMemo(() => {
    if (account?.connector?.ready && account?.address) return account.address;
  }, [account]);
  // const alreadyHasSBT = useMemo(
  //   () =>
  //     proofMetadata.filter((item) => item.proofType === params.proofType)
  //       .length > 0,
  //   [proofMetadata, params.proofType]
  // );
  const hasNecessaryCreds = useMemo(() => {
    if (params.proofType === "uniqueness") {
      return !!sortedCreds?.[serverAddress["idgov-v2"]]?.creds;
    } else if (params.proofType === "us-residency") {
      return (
        sortedCreds?.[serverAddress["idgov-v2"]]?.metadata?.rawCreds
          ?.countryCode === 2
      );
    } else if (params.proofType === "uniqueness-phone") {
      return !!sortedCreds?.[serverAddress["phone-v2"]]?.creds;
    } else if (params.proofType === "medical-specialty") {
      return !!sortedCreds?.[serverAddress["med"]]?.creds;
    }
  }, [sortedCreds, params.proofType]);
  const nonUSResidentTryingToProveUSResidency = useMemo(() => {
    const countryCode =
      sortedCreds?.[serverAddress["idgov-v2"]]?.metadata?.rawCreds?.countryCode;
    if (params.proofType === "us-residency" && countryCode) {
      return countryCode !== 2;
    }
  }, [sortedCreds, params.proofType]);

  const proofs = {
    "us-residency": {
      name: "US Residency",
      // contractName: "IsUSResident",
      contractName: "IsUSResidentV2" as const,
    },
    uniqueness: {
      name: "Uniqueness (government ID)",
      // contractName: "SybilResistance",
      contractName: "SybilResistanceV2" as const,
    },
    "uniqueness-phone": {
      name: "Uniqueness (phone number)",
      contractName: "SybilResistancePhone" as const,
    },
    "medical-specialty": {
      name: "Medical Specialty",
      contractName: "MedicalSpecialty" as const,
    },
  };

  // Steps:
  // 1. Get & set creds
  // 2. Get & set proof
  // 3. Submit proof tx

  useEffect(
    () => {
      if (params.proofType === "us-residency") {
        if (loadingUSResidencyProof) {
          // Set proof to null if proof is loading. This handles the case where a proof has already
          // been set in the state of this hook but proofs in context are being forced to reload.
          // Force reloads of proofs occur after adding a leaf to the Merkle tree.
          setProof(null);
        } else if (!usResidencyProof) {
          // loadUSResidencyProof(true);
        } else {
          setProof(usResidencyProof);
        }
      } else if (params.proofType === "uniqueness") {
        if (loadingUniquenessProof) {
          setProof(null);
        } else if (!uniquenessProof) {
          // loadUniquenessProof(true);
        } else {
          setProof(uniquenessProof);
        }
      } else if (params.proofType === "uniqueness-phone") {
        if (loadingUniquenessPhoneProof) {
          setProof(null);
        } else if (!uniquenessPhoneProof) {
          // loadUniquenessPhoneProof(true);
        } else {
          setProof(uniquenessPhoneProof);
        }
      } else if (params.proofType === "medical-specialty") {
        if (loadingMedicalSpecialtyProof) {
          setProof(null);
        } else if (!medicalSpecialtyProof) {
          // loadMedicalSpecialtyProof(true);
        } else {
          setProof(medicalSpecialtyProof);
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
      loadingMedicalSpecialtyProof,
    ]
  );

  return {
    params,
    proofs,
    // alreadyHasSBT,
    accountReadyAddress,
    hasNecessaryCreds,
    nonUSResidentTryingToProveUSResidency,
    proof,
    submissionConsent,
    setSubmissionConsent,
    proofSubmissionSuccess,
    setProofSubmissionSuccess,
    error,
    setError,
  };
};

export default useProofsState;
