import { Buffer } from "buffer";
import { ethers } from "ethers";
import LitJsSdk from "@lit-protocol/sdk-browser";
import { idServerUrl, defaultActionId, chainUsedForLit } from "../constants/misc";
import lit from './lit';


/**
 * @typedef {Object} ProofMetadataItem
 * @property {string} proofType
 * @property {string} [actionId] Only required if proofType is 'uniqueness'
 * @property {string} address 
 * @property {number} chainId 
 * @property {number} blockNumber 
 * @property {string} txHash 
 * @property {string|Array<string>} credentials
 */

/**
 * @typedef {Array<ProofMetadataItem>} ProofMetadata
 */

/**
 * @typedef {string} EncryptedProofMetadata
 */

/**
 * Lit+server helpers
 */

/**
 * @param {string} input
 * @returns {Promise<string>}
 */
export async function sha256(input) {
  const data =  new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(digest).toString('hex')
}

/**
 * @param {object | Array} data js object to be encrypted, e.g., plaintext credentials object
 * @param {object} litAuthSig SIWE-compliant object
 * @returns {Promise<object>} { encryptedString, encryptedSymmetricKey }
 */
 export async function encryptObject(data, litAuthSig) {
  const stringifiedCreds = JSON.stringify(data)
  const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain: chainUsedForLit })
  const acConditions = lit.getAccessControlConditions(authSig.address)
  const { 
    encryptedString, 
    encryptedSymmetricKey 
  } = await lit.encrypt(stringifiedCreds, chainUsedForLit, acConditions, authSig)
  return { encryptedString, encryptedSymmetricKey };
}

/**
 * Set user credentials in localStorage
 * @param {string} sigDigest 
 * @param {string} encryptedCredentials 
 * @param {string} encryptedSymmetricKey 
 * @returns {Promise<boolean>} True if successful, false if error occurs
 */
export async function setLocalUserCredentials(sigDigest, encryptedCredentials, encryptedSymmetricKey) {
  try {
    window.localStorage.setItem('holoSigDigest', sigDigest)
    window.localStorage.setItem('holoEncryptedCredentials', encryptedCredentials)
    window.localStorage.setItem('holoEncryptedCredentialsSymmetricKey', encryptedSymmetricKey)
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * @param {string} encryptedData String that should be an object when decrypted
 * @param {*} encryptedSymmetricKey 
 * @param {*} litAuthSig 
 * @returns {object}
 */
export async function decryptObjectWithLit(encryptedData, encryptedSymmetricKey, litAuthSig) {
  const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain: chainUsedForLit })
  const acConditions = lit.getAccessControlConditions(authSig.address)
  try {
    const stringifiedCreds = await lit.decrypt(encryptedData, encryptedSymmetricKey, chainUsedForLit, acConditions, litAuthSig)
    return JSON.parse(stringifiedCreds);
  } catch (err) {
    console.log(err);
  }
}

/**
 * Returns encrypted credentials from localStorage if present. Otherwise queries credential storage API
 * @returns {object} { sigDigest, encryptedCredentials, encryptedSymmetricKey } if successful
 */
export function getLocalEncryptedUserCredentials() {
  const localSigDigest = window.localStorage.getItem('holoSigDigest')
  const localEncryptedCreds = window.localStorage.getItem('holoEncryptedCredentials')
  const localEncryptedSymmetricKey = window.localStorage.getItem('holoEncryptedCredentialsSymmetricKey')
  const varsAreDefined = localSigDigest && localEncryptedCreds && localEncryptedSymmetricKey;
  const varsAreUndefinedStr = localSigDigest === 'undefined' || localEncryptedCreds === 'undefined' || localEncryptedSymmetricKey === 'undefined'
  if (varsAreDefined && !varsAreUndefinedStr) {
      console.log('Found creds in localStorage')
      return {
        sigDigest: localSigDigest,
        encryptedCredentials: localEncryptedCreds,
        encryptedSymmetricKey: localEncryptedSymmetricKey
      }
  }
  console.log('Did not find creds in localStorage')
}

export async function storeProofMetadata(tx, proofType, actionId, authSig, sigDigest) {
  try {
    const thisProofMetadata = {
      proofType: proofType,
      address: tx.from, 
      chainId: tx.chainId, 
      blockNumber: tx.blockNumber,
      txHash: tx.hash,
    }
    if (proofType === 'uniqueness') {
      thisProofMetadata.actionId = actionId || defaultActionId;
    }
    console.log('Storing proof metadata')
    console.log(thisProofMetadata)
    // Get proof metadata from localStorage or from server (if localStorage is empty)
    let oldEncryptedProofMetadata = getLocalProofMetadata()
    if (!oldEncryptedProofMetadata) {
      const resp = await fetch(`${idServerUrl}/proof-metadata?sigDigest=${sigDigest}`)
      const data = await resp.json();
      if (data) oldEncryptedProofMetadata = data
    }
    const oldProofMetadataArr = oldEncryptedProofMetadata ? await decryptObjectWithLit(
      oldEncryptedProofMetadata.encryptedProofMetadata, 
      oldEncryptedProofMetadata.encryptedSymmetricKey, 
      authSig
    ) : [];
    // Merge old proof metadata with new proof metadata
    const newProofMetadataArr = Array.from(
      oldProofMetadataArr.length > 0 ? [...oldProofMetadataArr, thisProofMetadata] : [thisProofMetadata]
    )

    const { encryptedString, encryptedSymmetricKey } = await encryptObject(newProofMetadataArr, authSig)
    setLocalEncryptedProofMetadata(encryptedString, encryptedSymmetricKey)
    
    // Store encrypted proof metadata in server
    const reqBody = {
      sigDigest: sigDigest,
      encryptedProofMetadata: encryptedString,
      encryptedSymmetricKey: encryptedSymmetricKey
    }
    const resp = await fetch(`${idServerUrl}/proof-metadata`, {
      method: 'POST',
      body: JSON.stringify(reqBody)
    })
    const data = await resp.json();
  } catch (err) {
    console.log(err)
  }
}

export function setLocalEncryptedProofMetadata(encryptedProofMetadata, encryptedSymmetricKey) {
  window.localStorage.setItem('holoEncryptedProofMetadata', encryptedProofMetadata)
  window.localStorage.setItem('holoProofMetadataSymmetricKey', encryptedSymmetricKey)
}

export function getLocalProofMetadata() {
  const localSigDigest = window.localStorage.getItem('holoSigDigest')
  const localEncryptedProofMetadata = window.localStorage.getItem('holoEncryptedProofMetadata')
  const localEncryptedSymmetricKey = window.localStorage.getItem('holoProofMetadataSymmetricKey')
  const varsAreDefined = localSigDigest && localEncryptedProofMetadata && localEncryptedSymmetricKey;
  const varsAreUndefinedStr = localSigDigest === 'undefined' || localEncryptedProofMetadata === 'undefined' || localEncryptedSymmetricKey === 'undefined'
  if (varsAreDefined && !varsAreUndefinedStr) {
      console.log('Found proof metadata in localStorage')
      return {
        sigDigest: localSigDigest,
        encryptedProofMetadata: localEncryptedProofMetadata,
        encryptedSymmetricKey: localEncryptedSymmetricKey
      }
  }
  console.log('Did not find proof metadata in localStorage')
}

export function generateSecret() {
  const newSecret = new Uint8Array(16);
  crypto.getRandomValues(newSecret);
  return ethers.BigNumber.from(newSecret).toHexString();
}

/**
 * TODO: Remove these functions?
 * 
 * Helpers for interacting with Holonym browser extension and for zokrates
 */

let extensionId;
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  extensionId =
    process.env.REACT_APP_EXTENSION_ID || "cilbidmppfndfhjafdlngkaabddoofea";
  if(!process.env.REACT_APP_EXTENSION_ID){ console.error("Warning: no extension ID specified")}
} else {
  // production code
  extensionId = "obhgknpelgngeabaclepndihajndjjnb";
}

console.log(extensionId, "extension id");
// Max length of encrypt-able string using RSA-OAEP with SHA256 where
// modulusLength == 4096: 446 characters.
const maxEncryptableLength = 446;

/**
 * Request from the Holo browser extension the user's public key.
 */
async function getPublicKey() {
  return new Promise((resolve) => {
    const message = { command: "getHoloPublicKey" };
    // eslint-disable-next-line no-undef
    chrome.runtime.sendMessage(extensionId, message, (resp) => {
      resolve(resp);
    });
  });
}

/**
 * @param {SubtleCrypto.JWK} publicKey
 * @param {string} message
 * @returns {Promise<string>} Encrypted message
 */
async function encrypt(publicKey, message = "hello world!") {
  const algo = {
    name: "RSA-OAEP",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  };
  let args = ["jwk", publicKey, algo, false, ["encrypt"]];
  const pubKeyAsCryptoKey = await window.crypto.subtle.importKey(...args);
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);
  args = ["RSA-OAEP", pubKeyAsCryptoKey, encodedMessage];
  const encryptedMessage = await window.crypto.subtle.encrypt(...args);
  return JSON.stringify(Array.from(new Uint8Array(encryptedMessage)));
}

async function encryptForExtension(message) {
  const encryptionKey = await getPublicKey();
  const stringifiedMsg = JSON.stringify(message);
  const usingSharding = stringifiedMsg.length > maxEncryptableLength;
  let encryptedMessage; // array<string> if sharding, string if not sharding
  if (usingSharding) {
    encryptedMessage = [];
    for (let i = 0; i < stringifiedMsg.length; i += maxEncryptableLength) {
      const shard = stringifiedMsg.substring(i, i + maxEncryptableLength);
      const encryptedShard = await encrypt(encryptionKey, shard);
      encryptedMessage.push(encryptedShard);
    }
  } else {
    encryptedMessage = await encrypt(encryptionKey, stringifiedMsg);
  }
  return { encryptedMessage: encryptedMessage, sharded: usingSharding };
}

/**
 * Encrypt and store the provided credentials with the Holonym browser extension.
 * @param {Object} credentials creds object from Holonym server
 */
export async function storeCredentials(credentials) {
  return new Promise(async (resolve) => {
    const { encryptedMessage, sharded } = await encryptForExtension(credentials);
    // Send encrypted credentials to Holonym extension
    const payload = {
      command: "setHoloCredentials",
      sharded: sharded,
      credentials: encryptedMessage,
    };
    const callback = (resp) => resolve(resp?.success);
    // eslint-disable-next-line no-undef
    chrome.runtime.sendMessage(extensionId, payload, callback);
  });
}

// For case where user hasn't registered prior to attempting to store credentials
export function getIsHoloRegistered() {
  return new Promise((resolve) => {
    const payload = {
      command: "holoGetIsRegistered",
    };
    const callback = (resp) => resolve(resp.isRegistered);
    // eslint-disable-next-line no-undef
    chrome.runtime.sendMessage(extensionId, payload, callback);
    console.log("sent to", extensionId);
  });
}

export function toU32StringArray(bytes) {
  let u32s = chunk(bytes.toString("hex"), 8);
  return u32s.map((x) => parseInt(x, 16).toString());
}
export function chunk(arr, chunkSize) {
  let out = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    out.push(chunk);
  }
  return out;
}

export function requestCredentials() {
  return new Promise((resolve) => {
    const payload = {
      command: "getHoloCredentials",
    };
    const callback = (resp) => {
      resolve(resp);
    };
    // eslint-disable-next-line no-undef
    chrome.runtime.sendMessage(extensionId, payload, callback);
  });
}
