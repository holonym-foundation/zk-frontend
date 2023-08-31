import { TransactionResponse } from "@ethersproject/abstract-provider";
import { Proof } from "zokrates-js";

export type WagmiAccount = {
  account:
    | {
        address?: string;
        connector?: {
          ready: boolean;
          id: string | undefined;
        };
      }
    | undefined;
};

export type ActiveChain = {
  activeChain:
    | {
        id: number;
      }
    | undefined;
};

export type SignatureGateData = {
  holoAuthSig: string | undefined;
  holoAuthSigDigest: string | undefined;
  holoKeyGenSig: string | undefined;
  holoKeyGenSigDigest: string | undefined;
};

export type HoloAuthSigContextType = {
  signHoloAuthMessage: () => Promise<void>;
  holoAuthSigIsError: boolean;
  holoAuthSigIsLoading: boolean;
  holoAuthSigIsSuccess: boolean;
  holoAuthSig: string;
  holoAuthSigDigest: string;
  clearHoloAuthSig: () => void;
};

export type HoloKeyGenSigContextType = {
  signHoloKeyGenMessage: () => Promise<void>;
  holoKeyGenSigIsError: boolean;
  holoKeyGenSigIsLoading: boolean;
  holoKeyGenSigIsSuccess: boolean;
  holoKeyGenSig: string;
  holoKeyGenSigDigest: string;
  clearHoloKeyGenSig: () => void;
};

export type IssuedCredentialBase = {
  creds: {
    issuerAddress: string;
    secret: string;
    customFields: [string, string];
    iat: string;
    scope: string;
    serializedAsPreimage: [string, string, string, string, string, string];
    // newSecret and serializedAsNewPreimage are added client-side during issuance
    newSecret?: string;
    serializedAsNewPreimage?: [string, string, string, string, string, string];
  };
  leaf: string;
  pubkey: {
    x: string;
    y: string;
  };
  signature: {
    R8: {
      x: string;
      y: string;
    };
    S: string;
  };
  newLeaf?: string; // Added client-side during issuance
};

export type IssuedCredentialMetadata = {
  rawCreds: {
    [field: string]: any;
  };
  derivedCreds: {
    [field: string]: {
      value: string;
      derivationFunction: string; // e.g., "poseidon";
      inputFields: Array<string>;
    };
  };
  fieldsInLeaf: [string, string, string, string, string, string];
};

export type SortedCreds = {
  [issuer: string]: IssuedCredentialBase &
    Partial<{
      metadata: IssuedCredentialMetadata;
    }>;
};

export type IssuedCredentialMetadataGovID = {
  rawCreds: {
    countryCode: number;
    firstName: string;
    middleName: string;
    lastName: string;
    city: string;
    subdivision: string;
    zipCode: number;
    streetNumber: number;
    streetName: string;
    streetUnit: number;
    completedAt: string;
    birthdate: string;
    expirationDate: string;
  };
  derivedCreds: {
    nameDobCitySubdivisionZipStreetExpireHash: {
      value: string;
      derivationFunction: "poseidon";
      inputFields: [
        "derivedCreds.nameHash.value",
        "rawCreds.birthdate",
        "derivedCreds.addressHash.value",
        "rawCreds.expirationDate"
      ];
    };
    streetHash: {
      value: string;
      derivationFunction: "poseidon";
      inputFields: [
        "rawCreds.streetNumber",
        "rawCreds.streetName",
        "rawCreds.streetUnit"
      ];
    };
    addressHash: {
      value: string;
      derivationFunction: "poseidon";
      inputFields: [
        "rawCreds.city",
        "rawCreds.subdivision",
        "rawCreds.zipCode",
        "derivedCreds.streetHash.value"
      ];
    };
    nameHash: {
      value: string;
      derivationFunction: "poseidon";
      inputFields: [
        "rawCreds.firstName",
        "rawCreds.middleName",
        "rawCreds.lastName"
      ];
    };
  };
  fieldsInLeaf: [
    "issuer",
    "secret",
    "rawCreds.countryCode",
    "derivedCreds.nameDobCitySubdivisionZipStreetExpireHash.value",
    "rawCreds.completedAt",
    "scope"
  ];
};

export type ProofMetadataItem = {
  proofType: string;
  actionId?: string; // Only required if proofType is 'uniqueness'
  address: string;
  chainId: number;
  blockNumber?: number | bigint | string;
  txHash: string;
};

export type TransactionReceiptWithChainId = TransactionReceipt & {
  chainId: number;
}

export type ProofMetadataContextType = {
  proofMetadata: Array<ProofMetadataItem>;
  loadingProofMetadata: boolean;
  addProofMetadataItem: (
    tx: TransactionReceiptWithChainId,
    senderAddress: string,
    proofType: string,
    actionId?: string
  ) => Promise<boolean>;
};

export type ProofContextType = {
  uniquenessProof: any;
  loadUniquenessProof: (
    runInMainThread?: boolean,
    forceReload?: boolean
  ) => Promise<void>;
  loadingUniquenessProof: boolean;
  uniquenessPhoneProof: any;
  loadUniquenessPhoneProof: (
    runInMainThread?: boolean,
    forceReload?: boolean
  ) => Promise<void>;
  loadingUniquenessPhoneProof: boolean;
  usResidencyProof: any;
  loadUSResidencyProof: (
    runInMainThread?: boolean,
    forceReload?: boolean
  ) => Promise<void>;
  loadingUSResidencyProof: boolean;
  medicalSpecialtyProof: any;
  loadMedicalSpecialtyProof: (
    runInMainThread?: boolean,
    forceReload?: boolean
  ) => Promise<void>;
  loadingMedicalSpecialtyProof: boolean;
  govIdFirstNameLastNameProof: any;
  loadGovIdFirstNameLastNameProof: (
    runInMainThread?: boolean,
    forceReload?: boolean
  ) => Promise<void>;
  loadingGovIdFirstNameLastNameProof: boolean;
  kolpProof: any;
  loadKOLPProof: (
    runInMainThread?: boolean,
    forceReload?: boolean,
    newSecret?: string | null,
    serializedAsNewPreimage?: Array<string> | null
  ) => Promise<void>;
  loadingKOLPProof: boolean;
  // load all proofs
  loadProofs: (suggestForceReload?: boolean) => Promise<void>;
};

export type ProofGenArtifacts = {
  [circuitName: string]: {
    program: Uint8Array;
    abi: any;
  };
};

export type IdenfySessionCreationResponse = {
  scanRef: string;
  url: string;
};

export type SessionStatusResponse = {
  veriff: {
    sessionId: string;
    status: string;
    failureReason: string;
  };
  idenfy: {
    scanRef: string;
    status: string;
    failureReason: any;
  };
  onfido: {
    check_id: string;
    status: string;
    result: string;
    failureReason: Array<string>;
  };
};

export type IdServerSessionsResponse = Array<{
  _id: string;
  sigDigest: string;
  idvProvider: string;
  status: 'NEEDS_PAYMENT' | 'IN_PROGRESS' | 'ISSUED' | 'VERIFICATION_FAILED';
  txHash?: string;
  chainId?: number;
  sessionId?: string;
  scanRef?: string;
  check_id?: string;  
}>;

export type IPAndCountry = {
  ip: string;
  country: string;
};
