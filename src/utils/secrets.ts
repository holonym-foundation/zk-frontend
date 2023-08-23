import { Buffer } from "buffer";
import { ethers, Transaction } from "ethers";
import { TransactionReceipt } from "viem";
import aesjs from "aes-js";
import {
  idServerUrl,
  issuerWhitelist,
  defaultActionId,
  zokratesFieldPrime,
} from "../constants";
import { proveKnowledgeOfLeafPreimage } from "./proofs";
import {
  SortedCreds,
  ProofMetadataItem,
  TransactionReceiptWithChainId,
} from "../types";

/**
 * @typedef {Array<ProofMetadataItem>} ProofMetadata
 */

/**
 * @typedef {string} EncryptedProofMetadata
 */

export async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("hex");
}

/**
 * NOTE: Use sha256(userSignature) as the key
 * @param data object, array, or string to encrypt
 * @param key must be 32-byte hexstring
 */
export function encryptWithAES(
  data: Object | Array<any> | string,
  key: string
) {
  const dataAsStr = typeof data !== "string" ? JSON.stringify(data) : data;
  const objBytes = aesjs.utils.utf8.toBytes(dataAsStr);
  const formattedKey = aesjs.utils.hex.toBytes(
    key.startsWith("0x") ? key.slice(2) : key
  );
  const aesCtr = new aesjs.ModeOfOperation.ctr(formattedKey);
  const encryptedBytes = aesCtr.encrypt(objBytes);
  return aesjs.utils.hex.fromBytes(encryptedBytes);
}

/**
 * NOTE: Use sha256(userSignature) as the key
 * @param data string to decrypt, in hex
 * @param key must be 32-byte hexstring
 * @returns decrypted object, array, or string, depending on what was originally encrypted
 */
export function decryptWithAES(
  data: string,
  key: string
): Object | Array<any> | string {
  const formattedData = data.startsWith("0x") ? data.slice(2) : data;
  const encryptedBytes = aesjs.utils.hex.toBytes(formattedData);
  const formattedKey = aesjs.utils.hex.toBytes(
    key.startsWith("0x") ? key.slice(2) : key
  );
  const aesCtr = new aesjs.ModeOfOperation.ctr(formattedKey);
  const decryptedBytes = aesCtr.decrypt(encryptedBytes);
  const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
  try {
    return JSON.parse(decryptedText);
  } catch (err) {
    return decryptedText;
  }
}

/**
 * KOLP == Knowledge of Leaf Preimage
 */
export function getLatestKolpProof() {
  const cachedKolpProofStr = localStorage.getItem("latest-kolp-proof");
  if (
    cachedKolpProofStr &&
    cachedKolpProofStr !== "undefined" &&
    cachedKolpProofStr !== "null"
  ) {
    try {
      return JSON.parse(cachedKolpProofStr);
    } catch (err) {
      return null;
    }
  }
  return null;
}

export function setLatestKolpProof(kolpProof: any) {
  if (kolpProof) {
    try {
      localStorage.setItem("latest-kolp-proof", JSON.stringify(kolpProof));
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
}

/**
 * Set user credentials in localStorage
 * @param encryptedCredentialsAES credentials encrypted with AES
 * @returns True if successful, false otherwise
 */
export function setLocalUserCredentials(encryptedCredentialsAES: string) {
  try {
    window.localStorage.setItem(
      "holoEncryptedCredentialsAES",
      encryptedCredentialsAES
    );
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Returns encrypted credentials from localStorage if present
 * @returns `{ sigDigest, encryptedCredentialsAES }` if successful
 */
export function getLocalEncryptedUserCredentials() {
  const localEncryptedCredentialsAES = window.localStorage.getItem(
    "holoEncryptedCredentialsAES"
  );
  const varsAreDefined = localEncryptedCredentialsAES;
  const varsAreUndefinedStr = localEncryptedCredentialsAES === "undefined";
  if (varsAreDefined && !varsAreUndefinedStr) {
    return {
      encryptedCredentialsAES: localEncryptedCredentialsAES,
    };
  }
}

export async function getRemoteEncryptedUserCredentials(
  holoAuthSigDigest: string
) {
  try {
    const resp = await fetch(
      `${idServerUrl}/credentials?sigDigest=${holoAuthSigDigest}`
    );
    const data = await resp.json();
    if (!data) throw new Error("No data returned from remote backup");
    if (data?.error) {
      console.error("Error fetching creds from remote backup", data.error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Error fetching creds from remote backup", err);
    return null;
  }
}

/**
 * Get credentials from localStorage and remote backup. Also re-stores credentials
 * before returning them.
 * @param holoKeyGenSigDigest Used as key for AES encryption/decryption
 * @param holoAuthSigDigest
 * @param restore If true, will re-store credentials in localStorage and remote backup
 * @returns A sortedCreds object if credentials are found, null if not.
 */
export async function getCredentials(
  holoKeyGenSigDigest: string,
  holoAuthSigDigest: string,
  restore: boolean = true
) {
  // 1. Get encrypted creds from localStorage (if they are there)
  const localEncryptedCreds = getLocalEncryptedUserCredentials();
  // 2. Get encrypted creds from remote backup (if they are there)
  const remoteEncryptedCreds = await getRemoteEncryptedUserCredentials(
    holoAuthSigDigest
  );
  // 3. If AES-encrypted creds are present, decrypt those
  let decryptedLocalCredsAES: SortedCreds | undefined;
  if (
    localEncryptedCreds?.encryptedCredentialsAES &&
    localEncryptedCreds?.encryptedCredentialsAES !== "undefined" &&
    localEncryptedCreds?.encryptedCredentialsAES !== "null"
  ) {
    decryptedLocalCredsAES = decryptWithAES(
      localEncryptedCreds.encryptedCredentialsAES,
      holoKeyGenSigDigest
    ) as SortedCreds;
  }
  let decryptedRemoteCredsAES: SortedCreds | undefined;
  if (
    remoteEncryptedCreds?.encryptedCredentialsAES &&
    remoteEncryptedCreds?.encryptedCredentialsAES !== "undefined" &&
    remoteEncryptedCreds?.encryptedCredentialsAES !== "null"
  ) {
    decryptedRemoteCredsAES = decryptWithAES(
      remoteEncryptedCreds.encryptedCredentialsAES,
      holoKeyGenSigDigest
    ) as SortedCreds;
  }
  // 4. Merge local and remote creds
  // If user provides signature for incorrect decryption key (which will happen if the user signs from a different account than the one used when encrypting),
  // the decryption procedure will still return some result, so we check that the result contains expected properties before merging.
  // If there is a conflict between two credential sets, use the credentials that were most recently issued. There can be a conflict
  // if the user has credentials stored in multiple browsers and receives new credentials from an issuer.
  // allCreds has shape: [{ '0x1234': { completedAt: 123, rawCreds: {...} }, '0x5678': {...} }, ...]
  const allCreds: Array<SortedCreds> = [];
  if (decryptedRemoteCredsAES) allCreds.push(decryptedRemoteCredsAES);
  if (decryptedLocalCredsAES) allCreds.push(decryptedLocalCredsAES);
  let mergedCreds = {};
  for (const issuer of issuerWhitelist) {
    const credsFromIssuer = allCreds.filter(
      (sortedCredsTemp) => sortedCredsTemp[issuer]
    );
    if (credsFromIssuer.length === 1) {
      mergedCreds = {
        ...mergedCreds,
        [issuer]: credsFromIssuer[0][issuer],
      };
    } else if (credsFromIssuer.length > 1) {
      // User has multiple sets of credentials for the same issuer. Use the most recently issued set.
      const sortedCredsFromIssuer = credsFromIssuer.sort((a, b) => {
        if (!(a[issuer]?.creds?.iat || b[issuer]?.creds?.iat)) return 0;
        if (!a[issuer]?.creds?.iat) return 1;
        if (!b[issuer]?.creds?.iat) return -1;

        // try-catch in case an iat isn't parsable as an ethers BigNumber. This will only happen if an issuer
        // doesn't follow the standard, which is unlikely, but if it does happen and we do not handle it, the
        // user could be blocked from getting their credentials.
        try {
          const bSecondsSince1900 = parseInt(
            ethers.BigNumber.from(b[issuer].creds.iat).toString()
          );
          const aSecondsSince1900 = parseInt(
            ethers.BigNumber.from(a[issuer].creds.iat).toString()
          );
          return bSecondsSince1900 - aSecondsSince1900;
        } catch (err) {
          console.error(err);
          return 0;
        }
      });
      mergedCreds = {
        ...mergedCreds,
        [issuer]: sortedCredsFromIssuer[0][issuer],
      };
    }
  }
  // 5. Store merged creds in case there is a difference between local and remote
  if (restore) {
    storeCredentials(mergedCreds, holoKeyGenSigDigest, holoAuthSigDigest);
  }
  if (Object.keys(mergedCreds).length > 0) {
    return mergedCreds;
  }
  return null;
}

/**
 * Store credentials in localStorage and remote backup. The request to the remote backup will fail if the
 * user does not have credentials that can be used to produce a proof of knowledge of leaf preimage.
 * @param creds Plaintext sorted creds. IMPORTANT: creds should include all of the user's credentials.
 * If an incorrect or incomplete creds object is provided, the user's valid credentials could be overwritten.
 * @param holoKeyGenSigDigest Key for AES encryption/decryption.
 * @param holoAuthSigDigest Sig digest used for lookup in remote backup.
 * @param proof Optional. Proof of knowledge of leaf preimage. If provided, it will be used in
 * the request to the remote backup.
 * @returns True if storage in remote backup is successful, false otherwise.
 */
export async function storeCredentials(
  creds: SortedCreds,
  holoKeyGenSigDigest: string,
  holoAuthSigDigest: string,
  proof?: any
) {
  // 1. Encrypt creds with AES
  const encryptedCredsAES = encryptWithAES(creds, holoKeyGenSigDigest);
  // 2. Store encrypted creds in localStorage
  setLocalUserCredentials(encryptedCredsAES);
  // 3. Store encrypted creds in remote backup
  try {
    let kolpProof = proof ?? getLatestKolpProof();
    if (!kolpProof) {
      for (const issuer of Object.keys(creds)) {
        if (creds[issuer]?.creds?.serializedAsNewPreimage) {
          kolpProof = await proveKnowledgeOfLeafPreimage(
            // @ts-ignore
            creds[issuer].creds.serializedAsNewPreimage.map((item) =>
              ethers.BigNumber.from(item || "0").toString()
            ),
            // @ts-ignore
            creds[issuer].creds.newSecret
          );
          break;
        }
      }
    }
    setLatestKolpProof(kolpProof);
    // This request will fail if the user does not have a valid proof. Hence the try-catch.
    const resp = await fetch(`${idServerUrl}/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sigDigest: holoAuthSigDigest,
        proof: kolpProof,
        encryptedCredentialsAES: encryptedCredsAES,
      }),
    });
    if (resp.status !== 200) throw new Error((await resp.json()).error);
    return true;
  } catch (err) {
    console.error(
      "The following error occurred while sending encrypted creds to remote backup.",
      err
    );
    return false;
  }
}

export function proofMetadataItemFromTx(
  tx: TransactionReceiptWithChainId,
  senderAddress: string,
  proofType: string,
  actionId?: string
) {
  const senderAddrHex = ethers.BigNumber.from(
    senderAddress ?? "0x00"
  ).toHexString();
  const missingLeadingZeros = 42 - senderAddrHex.length;
  const senderAddr =
    missingLeadingZeros === 0
      ? senderAddrHex
      : `0x${"0".repeat(missingLeadingZeros)}${senderAddrHex.slice(2)}`;
  const proofMetadataItem: ProofMetadataItem = {
    proofType: proofType,
    address: senderAddr,
    chainId: tx.chainId,
    blockNumber: tx.blockNumber,
    txHash: tx.transactionHash,
  };
  if (proofType === "uniqueness") {
    proofMetadataItem.actionId = actionId || defaultActionId;
  }
  return proofMetadataItem;
}

// export async function addProofMetadataItem(tx, senderAddress, proofType, actionId, holoAuthSigDigest, holoKeyGenSigDigest) {
export async function addProofMetadataItem(
  proofMetadataItem: ProofMetadataItem,
  holoAuthSigDigest: string,
  holoKeyGenSigDigest: string
) {
  try {

    // convert all bigints in proofmetadataitem to strings
    for (const key of Object.keys(proofMetadataItem)) {
      if (typeof proofMetadataItem[key as keyof typeof proofMetadataItem] === "bigint") {
        // @ts-ignore
        proofMetadataItem[key] = proofMetadataItem[key].toString();
      }
    }

    // const proofMetadataItem = proofMetadataItemFromTx(tx, senderAddress, proofType, actionId);
    // 1. Get old proof metadata
    const oldProofMetadata = await getProofMetadata(
      holoKeyGenSigDigest,
      holoAuthSigDigest,
      false
    );
    // 2. Merge old proof metadata with new proof metadata
    const newProofMetadataArr = oldProofMetadata.concat(proofMetadataItem);
    // 3. Encrypt merged proof metadata with AES
    const encryptedProofMetadataAES = encryptWithAES(
      newProofMetadataArr,
      holoKeyGenSigDigest
    );
    // 4. Store encrypted proof metadata in localStorage and in remote backup
    setLocalEncryptedProofMetadata(encryptedProofMetadataAES);
    const resp2 = await fetch(`${idServerUrl}/proof-metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sigDigest: holoAuthSigDigest,
        encryptedProofMetadataAES: encryptedProofMetadataAES,
      }),
    });
    if (resp2.status !== 200) throw new Error((await resp2.json()).error);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function setLocalEncryptedProofMetadata(
  encryptedProofMetadataAES: string
) {
  try {
    window.localStorage.setItem(
      "holoEncryptedProofMetadataAES",
      encryptedProofMetadataAES
    );
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function getLocalProofMetadata() {
  const localEncryptedProofMetadataAES = window.localStorage.getItem(
    "holoEncryptedProofMetadataAES"
  );
  const varsAreDefined = localEncryptedProofMetadataAES;
  const varsAreUndefinedStr = localEncryptedProofMetadataAES === "undefined";
  if (varsAreDefined && !varsAreUndefinedStr) {
    return {
      encryptedProofMetadataAES: localEncryptedProofMetadataAES,
    };
  }
}

export async function getProofMetadata(
  holoKeyGenSigDigest: string,
  holoAuthSigDigest: string,
  restore: boolean = false
) {
  // 1. Get local proof metadata
  const localProofMetadata = getLocalProofMetadata();
  // 2. Get remote proof metadata
  const resp = await fetch(
    `${idServerUrl}/proof-metadata?sigDigest=${holoAuthSigDigest}`
  );
  if (resp.status !== 200) throw new Error((await resp.json()).error);
  const remoteProofMetadata = await resp.json();
  // 3. If AES-encrypted proof metadata is present, decrypt it
  let proofMetadataArrAES: Array<ProofMetadataItem> = [];
  if (
    localProofMetadata?.encryptedProofMetadataAES &&
    localProofMetadata?.encryptedProofMetadataAES !== "undefined" &&
    localProofMetadata?.encryptedProofMetadataAES !== "null"
  ) {
    proofMetadataArrAES =
      (decryptWithAES(
        localProofMetadata.encryptedProofMetadataAES,
        holoKeyGenSigDigest
      ) as Array<ProofMetadataItem>) ?? [];
  }
  if (
    remoteProofMetadata?.encryptedProofMetadataAES &&
    remoteProofMetadata?.encryptedProofMetadataAES !== "undefined" &&
    remoteProofMetadata?.encryptedProofMetadataAES !== "null"
  ) {
    const remoteProofMetadataArrAES =
      (decryptWithAES(
        remoteProofMetadata.encryptedProofMetadataAES,
        holoKeyGenSigDigest
      ) as Array<ProofMetadataItem>) ?? [];
    proofMetadataArrAES = proofMetadataArrAES.concat(remoteProofMetadataArrAES);
  }
  // 5. Merge local and remote proof metadata
  const mergedProofMetadata: Array<ProofMetadataItem> = [];
  for (const item of proofMetadataArrAES) {
    if (!mergedProofMetadata.find((i) => i?.txHash === item?.txHash)) {
      mergedProofMetadata.push(item);
    }
  }
  // 6. Store merged proof metadata in localStorage and remote backup in case there is a difference between local and remote
  if (mergedProofMetadata.length > 0 && restore) {
    // encrypt mergedProofMetadata with AES
    const encryptedProofMetadataAES = encryptWithAES(
      mergedProofMetadata,
      holoKeyGenSigDigest
    );
    setLocalEncryptedProofMetadata(encryptedProofMetadataAES);
    try {
      // Ignore errors that occur here so that we can return the proof metadata
      const resp2 = await fetch(`${idServerUrl}/proof-metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sigDigest: holoAuthSigDigest,
          encryptedProofMetadataAES: encryptedProofMetadataAES,
        }),
      });
      if (resp2.status !== 200) throw new Error((await resp2.json()).error);
    } catch (err) {
      console.error(err);
    }
  }
  return mergedProofMetadata;
}

export function generateSecret() {
  const newSecret = new Uint8Array(64);
  crypto.getRandomValues(newSecret);
  const primeAsBigNum = ethers.BigNumber.from(zokratesFieldPrime);
  return ethers.BigNumber.from(newSecret).mod(primeAsBigNum).toHexString();
}
