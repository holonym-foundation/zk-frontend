import { Buffer } from "buffer";
import { ethers } from "ethers";
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
 * @param {string} encryptedCredentials 
 * @param {string} encryptedSymmetricKey 
 * @returns {Promise<boolean>} True if successful, false if error occurs
 */
export function setLocalUserCredentials(sigDigest, encryptedCredentials, encryptedSymmetricKey) {
  window.localStorage.setItem('holoSigDigest', sigDigest)
  window.localStorage.setItem('holoEncryptedCredentials', encryptedCredentials)
  window.localStorage.setItem('holoEncryptedCredentialsSymmetricKey', encryptedSymmetricKey)
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

export async function storeProofMetadata(tx, senderAddress, proofType, actionId, authSig, sigDigest) {
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
