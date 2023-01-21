import { Buffer } from "buffer";
import { ethers } from "ethers";
import aesjs from 'aes-js';
import { idServerUrl, defaultActionId, chainUsedForLit } from "../constants/misc";
import lit from './lit';
import { proveKnowledgeOfLeafPreimage } from "./proofs";


/**
 * @typedef {Object} ProofMetadataItem
 * @property {string} proofType
 * @property {string} [actionId] Only required if proofType is 'uniqueness'
 * @property {string} address 
 * @property {number} chainId 
 * @property {number} blockNumber 
 * @property {string} txHash 
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
 * NOTE: Use sha256(userSignature) as the key
 * @param {object | array | string} data object, array, or string to encrypt
 * @param {string} key must be 32-byte hexstring
 * @returns {Promise<string>}
 */
export function encryptWithAES(data, key) {
  const dataAsStr = typeof data !== 'string' ? JSON.stringify(data) : data;
  const objBytes = aesjs.utils.utf8.toBytes(dataAsStr);  
  const formattedKey = aesjs.utils.hex.toBytes(key.startsWith("0x") ? key.slice(2) : key);
  const aesCtr = new aesjs.ModeOfOperation.ctr(formattedKey);
  const encryptedBytes = aesCtr.encrypt(objBytes);
  return aesjs.utils.hex.fromBytes(encryptedBytes);
}

/**
 * NOTE: Use sha256(userSignature) as the key
 * @param {string} data string to decrypt, in hex
 * @param {string} key must be 32-byte hexstring
 * @returns {Promise<object | array | string>} decrypted object, array, or string, depending on what was originally encrypted
 */
export function decryptWithAES(data, key) {
  const formattedData = data.startsWith("0x") ? data.slice(2) : data;
  const encryptedBytes = aesjs.utils.hex.toBytes(formattedData);
  const formattedKey = aesjs.utils.hex.toBytes(key.startsWith("0x") ? key.slice(2) : key);
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
 * @param {object | Array} data js object to be encrypted, e.g., plaintext credentials object
 * @param {object} litAuthSig SIWE-compliant object
 * @returns {Promise<object>} { encryptedString, encryptedSymmetricKey }
 */
 export async function encryptObjectWithLit(data, litAuthSig) {
  const stringifiedCreds = JSON.stringify(data)
  const acConditions = lit.getAccessControlConditions(litAuthSig.address)
  const { 
    encryptedString, 
    encryptedSymmetricKey 
  } = await lit.encrypt(stringifiedCreds, chainUsedForLit, acConditions, litAuthSig)
  return { encryptedString, encryptedSymmetricKey };
}

/**
 * Set user credentials in localStorage
 * @param {string} sigDigest 
 * @param {string} encryptedCredentialsLit credentials encrypted with Lit - included for backwards compatibility
 * @param {string} encryptedSymmetricKey symmetric key used by Lit - included for backwards compatibility
 * @param {string} encryptedCredentialsAES credentials encrypted with AES
 * @returns {boolean} True if successful, false otherwise
 */
export function setLocalUserCredentials(sigDigest, encryptedCredentialsLit, encryptedSymmetricKey, encryptedCredentialsAES) {
  // TODO: After some time, remove use of Lit
  // TODO: At some point, don't store sigDigest under "holoSigDigest". It is redundant since we store it under "holoAuthSigDigest"
  try {
    window.localStorage.setItem('holoSigDigest', sigDigest)
    window.localStorage.setItem('holoEncryptedCredentials', encryptedCredentialsLit)
    window.localStorage.setItem('holoEncryptedCredentialsSymmetricKey', encryptedSymmetricKey)
    window.localStorage.setItem('holoEncryptedCredentialsAES', encryptedCredentialsAES)
    return true;
  } catch (err) {
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
  const acConditions = lit.getAccessControlConditions(litAuthSig.address)
  try {
    const stringifiedCreds = await lit.decrypt(encryptedData, encryptedSymmetricKey, chainUsedForLit, acConditions, litAuthSig)
    return JSON.parse(stringifiedCreds);
  } catch (err) {
    console.log(err);
  }
}

/**
 * Returns encrypted credentials from localStorage if present
 * @returns {object} { sigDigest, encryptedCredentials, encryptedSymmetricKey } if successful
 */
export function getLocalEncryptedUserCredentials() {
  // TODO: After some time, remove use of Lit
  const localSigDigest = window.localStorage.getItem('holoSigDigest')
  const localEncryptedCreds = window.localStorage.getItem('holoEncryptedCredentials') // for lit
  const localEncryptedSymmetricKey = window.localStorage.getItem('holoEncryptedCredentialsSymmetricKey') // for lit
  const localEncryptedCredentialsAES = window.localStorage.getItem('holoEncryptedCredentialsAES')
  const varsAreDefined = localSigDigest && localEncryptedCreds && localEncryptedSymmetricKey && localEncryptedCredentialsAES;
  const varsAreUndefinedStr = 
    localSigDigest === 'undefined' || 
    localEncryptedCreds === 'undefined' || 
    localEncryptedSymmetricKey === 'undefined'; // ||
    // Check for localEncryptedCredentialsAES undefined once we remove use of Lit
    // localEncryptedCredentialsAES === 'undefined'; 
  if (varsAreDefined && !varsAreUndefinedStr) {
      console.log('Found creds in localStorage')
      return {
        sigDigest: localSigDigest,
        encryptedCredentials: localEncryptedCreds,
        encryptedSymmetricKey: localEncryptedSymmetricKey,
        encryptedCredentialsAES: localEncryptedCredentialsAES,
      }
  }
  console.log('Did not find creds in localStorage')
}

export async function getRemoteEncryptedUserCredentials(holoAuthSigDigest) {
  try {
    console.log('Fetching creds from remote backup')
    const resp = await fetch(`${idServerUrl}/credentials?sigDigest=${holoAuthSigDigest}`)
    const data = await resp.json();
    console.log('Retrieved creds from remote backup')
    if (data.error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Get credentials from localStorage and remote backup.
 * @param {string} holoKeyGenSigDigest Used as key for AES encryption/decryption
 * @param {string} holoAuthSigDigest 
 * @param {object} litAuthSig
 * @param {boolean} restore Re-store merged creds locally and remotely after retrieving and merging them. This will
 * only work if the user has previously stored their credentials in remote backup under their holoAuthSigDigest (see id-server for details).
 * @returns A sortedCreds object if credentials are found, null if not.
 */
export async function getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig, restore = false) {
  // 1. Get encrypted creds from localStorage (if they are there)
  const localEncryptedCreds = getLocalEncryptedUserCredentials();
  // 2. Get encrypted creds from remote backup (if they are there)
  const remoteEncryptedCreds = await getRemoteEncryptedUserCredentials(holoAuthSigDigest);
  // 3. If AES-encrypted creds are present, decrypt those
  let decryptedLocalCredsAES;
  if (localEncryptedCreds?.encryptedCredentialsAES) {
    decryptedLocalCredsAES = decryptWithAES(localEncryptedCreds.encryptedCredentialsAES, holoKeyGenSigDigest);
  }
  let decryptedRemoteCredsAES;
  if (remoteEncryptedCreds?.encryptedCredentialsAES) {
    decryptedRemoteCredsAES = decryptWithAES(remoteEncryptedCreds.encryptedCredentialsAES, holoKeyGenSigDigest);
  }
  // 4. If Lit-encrypted creds are present, decrypt those
  let decryptedLocalCredsLit;
  if (localEncryptedCreds?.encryptedCredentials && localEncryptedCreds?.encryptedSymmetricKey) {
    decryptedLocalCredsLit = await decryptObjectWithLit(localEncryptedCreds.encryptedCredentials, localEncryptedCreds.encryptedSymmetricKey, litAuthSig);
  }
  let decryptedRemoteCredsLit;
  if (remoteEncryptedCreds?.encryptedCredentials && remoteEncryptedCreds?.encryptedSymmetricKey) {
    decryptedRemoteCredsLit = await decryptObjectWithLit(remoteEncryptedCreds.encryptedCredentials, remoteEncryptedCreds.encryptedSymmetricKey, litAuthSig);
  }
  // 5. Merge local and remote creds
  const mergedCreds = {
    ...decryptedLocalCredsAES,
    ...decryptedLocalCredsLit,
    ...decryptedRemoteCredsAES,
    ...decryptedRemoteCredsLit,
  }
  // 6. Store merged creds in case there is a difference between local and remote
  if (Object.keys(mergedCreds).length > 0) {
    if (restore) storeCredentials(mergedCreds, holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig);
    return mergedCreds;
  }
  return null;
}

/**
 * Store credentials in localStorage and remote backup. The request to the remote backup will fail if the
 * user does not have credentials that can be used to produce a proof of knowledge of leaf preimage.
 * @param {object} creds Plaintext sorted creds. IMPORTANT: creds should include all of the user's credentials.
 * If an incorrect or incomplete creds object is provided, the user's valid credentials could be overwritten. 
 * @param {string} holoKeyGenSigDigest Key for AES encryption/decryption.
 * @param {string} holoAuthSigDigest Sig digest used for lookup in remote backup.
 * @param {object} litAuthSig (Included for backwards compatibility. Should be phased out at some point.) 
 * @param {object} proof Optional. Proof of knowledge of leaf preimage. If provided, it will be used in
 * the request to the remote backup.
 * @returns True if storage in remote backup is successful, false otherwise.
 */
export async function storeCredentials(creds, holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig, proof) {
  // TODO: Remove Lit support after some time
  // 1. Encrypt creds with AES
  const encryptedCredsAES = encryptWithAES(creds, holoKeyGenSigDigest);
  // 2. encrypt creds with Lit
  const { 
    encryptedString: encryptedCredsLit, 
    encryptedSymmetricKey: encryptedSymmetricKeyLit
  } = await encryptObjectWithLit(creds, litAuthSig);
  // 3. Store encrypted creds in localStorage
  setLocalUserCredentials(holoAuthSigDigest, encryptedCredsLit, encryptedSymmetricKeyLit, encryptedCredsAES);
  // 4. Store encrypted creds in remote backup
  try {
    let kolpProof = proof;
    if (!kolpProof) {
      for (const issuer of Object.keys(creds)) {
        if (creds[issuer].serializedCreds) {
          kolpProof = await proveKnowledgeOfLeafPreimage(
            creds[issuer].serializedCreds.map(item => ethers.BigNumber.from(item || "0").toString()),
            creds[issuer].newSecret
          );
          break;
        }
      }
    }
    // This request will fail if the user does not have a valid proof. Hence the try-catch.
    console.log('sending encrypted creds to remote backup');
    const resp = await fetch(`${idServerUrl}/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sigDigest: holoAuthSigDigest,
        proof: kolpProof,
        encryptedCredentials: encryptedCredsLit,
        encryptedSymmetricKey: encryptedSymmetricKeyLit,
        encryptedCredentialsAES: encryptedCredsAES,
      })
    });
    if (resp.status !== 200) throw new Error((await resp.json()).error);
    return true;
  } catch (err) {
    console.error('The following error occurred while sending encrypted creds to remote backup.', err);
    return false;
  }
}

export async function storeProofMetadata(tx, senderAddress, proofType, actionId, authSig, sigDigest) {
  // TODO: Rewrite this using AES instead of Lit
  try {
    const senderAddrHex = ethers.BigNumber.from(
      senderAddress ?? '0x00'
    ).toHexString();
    const missingLeadingZeros = 42 - senderAddrHex.length;
    const senderAddr = 
      missingLeadingZeros === 0 
        ? senderAddrHex 
        : '0x' + '0'.repeat(missingLeadingZeros) + senderAddrHex.slice(2);
    const thisProofMetadata = {
      proofType: proofType,
      address: senderAddr, 
      chainId: tx.chainId, 
      blockNumber: tx.blockNumber,
      txHash: tx.transactionHash,
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
      oldProofMetadataArr?.length > 0 ? [...oldProofMetadataArr, thisProofMetadata] : [thisProofMetadata]
    )

    const { encryptedString, encryptedSymmetricKey } = await encryptObjectWithLit(newProofMetadataArr, authSig)
    setLocalEncryptedProofMetadata(encryptedString, encryptedSymmetricKey)
    
    // Store encrypted proof metadata in server
    const reqBody = {
      sigDigest: sigDigest,
      encryptedProofMetadata: encryptedString,
      encryptedSymmetricKey: encryptedSymmetricKey
    }
    const resp = await fetch(`${idServerUrl}/proof-metadata`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody)
    })
    const data = await resp.json();
  } catch (err) {
    console.log(err)
  }
}

export function setLocalEncryptedProofMetadata(encryptedProofMetadata, encryptedSymmetricKey) {
  try {
    window.localStorage.setItem('holoEncryptedProofMetadata', encryptedProofMetadata)
    window.localStorage.setItem('holoProofMetadataSymmetricKey', encryptedSymmetricKey)
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
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
