import { Buffer } from "buffer";
import { ethers } from "ethers";
import aesjs from 'aes-js';
import { idServerUrl, issuerWhitelist, defaultActionId, chainUsedForLit, zokratesFieldPrime } from "../constants/misc";
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
 * KOLP == Knowledge of Leaf Preimage
 */
export function getLatestKolpProof() {
  const cachedKolpProofStr = localStorage.getItem('latest-kolp-proof');
  if (cachedKolpProofStr && cachedKolpProofStr !== 'undefined' && cachedKolpProofStr !== 'null') {
    try {
      return JSON.parse(cachedKolpProofStr);
    } catch (err) {
      return null
    }
  }
  return null;
}

export function setLatestKolpProof(kolpProof) {
  if (kolpProof) {
    try {
      localStorage.setItem('latest-kolp-proof', JSON.stringify(kolpProof));
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
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
    if (!data) throw new Error('No data returned from remote backup')
    if (data?.error) {
      console.log('Error fetching creds from remote backup', data.error);
      return null;
    }
    if (data.encryptedCredentials) console.log('Retrieved creds from remote backup');
    return data;
  } catch (err) {
    console.log('Error fetching creds from remote backup', err);
    return null;
  }
}

/**
 * Get credentials from localStorage and remote backup. Also re-stores credentials
 * before returning them.
 * @param {string} holoKeyGenSigDigest Used as key for AES encryption/decryption
 * @param {string} holoAuthSigDigest 
 * @param {object} litAuthSig
 * @returns A sortedCreds object if credentials are found, null if not.
 */
export async function getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig) {
  // 1. Get encrypted creds from localStorage (if they are there)
  const localEncryptedCreds = getLocalEncryptedUserCredentials();
  // 2. Get encrypted creds from remote backup (if they are there)
  const remoteEncryptedCreds = await getRemoteEncryptedUserCredentials(holoAuthSigDigest);
  // 3. If AES-encrypted creds are present, decrypt those
  let decryptedLocalCredsAES;
  if (
    localEncryptedCreds?.encryptedCredentialsAES && 
    localEncryptedCreds?.encryptedCredentialsAES !== 'undefined' &&
    localEncryptedCreds?.encryptedCredentialsAES !== 'null'
  ) {
    decryptedLocalCredsAES = decryptWithAES(localEncryptedCreds.encryptedCredentialsAES, holoKeyGenSigDigest);
  }
  let decryptedRemoteCredsAES;
  if (
    remoteEncryptedCreds?.encryptedCredentialsAES && 
    remoteEncryptedCreds?.encryptedCredentialsAES !== 'undefined' &&
    remoteEncryptedCreds?.encryptedCredentialsAES !== 'null'
  ) {
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
  // If user provides signature for incorrect decryption key (which will happen if the user signs from a different account than the one used when encrypting), 
  // the decryption procedure will still return some result, so we check that the result contains expected properties before merging.
  // If there is a conflict between two credential sets, use the credentials that were most recently issued. There can be a conflict
  // if the user has credentials stored in multiple browsers and receives new credentials from an issuer.
  // allCreds has shape: [{ '0x1234': { completedAt: 123, rawCreds: {...} }, '0x5678': {...} }, ...]
  const allCreds = [];
  if (decryptedRemoteCredsAES) allCreds.push(decryptedRemoteCredsAES);
  if (decryptedRemoteCredsLit) allCreds.push(decryptedRemoteCredsLit);
  if (decryptedLocalCredsAES) allCreds.push(decryptedLocalCredsAES);
  if (decryptedLocalCredsLit) allCreds.push(decryptedLocalCredsLit);
  let mergedCreds = {};
  for (const issuer of issuerWhitelist) {
    const credsFromIssuer = allCreds.filter(sortedCredsTemp => sortedCredsTemp[issuer]);
    if (credsFromIssuer.length === 1) {
      mergedCreds = {
        ...mergedCreds,
        [issuer]: credsFromIssuer[0][issuer],
      }
    } else if (credsFromIssuer.length > 1) {
      // User has multiple sets of credentials for the same issuer. Use the most recently issued set.
      const sortedCredsFromIssuer = credsFromIssuer.sort(
        (a, b) => {
          if (!a[issuer]?.creds?.iat && !b[issuer]?.creds?.iat) return 0;
          if (!a[issuer]?.creds?.iat) return 1;
          if (!b[issuer]?.creds?.iat) return -1;

          // try-catch in case an iat isn't parsable as an ethers BigNumber. This will only happen if an issuer
          // doesn't follow the standard, which is unlikely, but if it does happen and we do not handle it, the
          // user could be blocked from getting their credentials.
          try {
            const bSecondsSince1900 = parseInt(ethers.BigNumber.from(b[issuer].creds.iat).toString());
            const aSecondsSince1900 = parseInt(ethers.BigNumber.from(a[issuer].creds.iat).toString());
            return bSecondsSince1900 - aSecondsSince1900; 
          } catch (err) {
            console.error(err);
            return 0;
          }
        }
      );
      mergedCreds = {
        ...mergedCreds,
        [issuer]: sortedCredsFromIssuer[0][issuer],
      }
    }
  }
  // 6. Store merged creds in case there is a difference between local and remote
  if (Object.keys(mergedCreds).length > 0) {
    storeCredentials(mergedCreds, holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig);
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
  // TODO: Remove Lit support after some time. Remember to update id-server as well.
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
    let kolpProof = proof ?? getLatestKolpProof();
    if (!kolpProof) {
      for (const issuer of Object.keys(creds)) {
        if (creds[issuer].serializedAsNewPreimage) {
          kolpProof = await proveKnowledgeOfLeafPreimage(
            creds[issuer].serializedAsNewPreimage.map(item => ethers.BigNumber.from(item || "0").toString()),
            creds[issuer].newSecret
          );
          break;
        }
      }
    }
    setLatestKolpProof(kolpProof);
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
    console.log('Successfully sent encrypted creds to remote backup.')
    return true;
  } catch (err) {
    console.error('The following error occurred while sending encrypted creds to remote backup.', err);
    return false;
  }
}

function proofMetadataItemFromTx(tx, senderAddress, proofType, actionId) {
  const senderAddrHex = ethers.BigNumber.from(
    senderAddress ?? '0x00'
  ).toHexString();
  const missingLeadingZeros = 42 - senderAddrHex.length;
  const senderAddr = 
    missingLeadingZeros === 0 
      ? senderAddrHex 
      : '0x' + '0'.repeat(missingLeadingZeros) + senderAddrHex.slice(2);
  const proofMetadataItem = {
    proofType: proofType,
    address: senderAddr, 
    chainId: tx.chainId, 
    blockNumber: tx.blockNumber,
    txHash: tx.transactionHash,
  }
  if (proofType === 'uniqueness') {
    proofMetadataItem.actionId = actionId || defaultActionId;
  }
  return proofMetadataItem;
} 

export async function addProofMetadataItem(tx, senderAddress, proofType, actionId, litAuthSig, holoAuthSigDigest, holoKeyGenSigDigest) {
  // TODO: Remove Lit support after some time
  try {
    const proofMetadataItem = proofMetadataItemFromTx(tx, senderAddress, proofType, actionId);
    console.log('Storing proof metadata')
    console.log(proofMetadataItem)
    // 1. Get old proof metadata
    const oldProofMetadata = await getProofMetadata(holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig, false);
    // 2. Merge old proof metadata with new proof metadata
    const newProofMetadataArr = oldProofMetadata.concat(proofMetadataItem);
    // 3. Encrypt merged proof metadata with Lit and AES
    const encryptedProofMetadataLit = await encryptObjectWithLit(newProofMetadataArr, litAuthSig);
    const encryptedProofMetadataAES = encryptWithAES(newProofMetadataArr, holoKeyGenSigDigest);
    // 4. Store encrypted proof metadata in localStorage and in remote backup
    setLocalEncryptedProofMetadata(
      encryptedProofMetadataLit?.encryptedString,
      encryptedProofMetadataLit?.encryptedSymmetricKey,
      encryptedProofMetadataAES
    );
    const resp2 = await fetch(`${idServerUrl}/proof-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sigDigest: holoAuthSigDigest,
        encryptedProofMetadata: encryptedProofMetadataLit?.encryptedString,
        encryptedSymmetricKey: encryptedProofMetadataLit?.encryptedSymmetricKey,
        encryptedProofMetadataAES: encryptedProofMetadataAES
      })
    });
    if (resp2.status !== 200) throw new Error((await resp2.json()).error);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export function setLocalEncryptedProofMetadata(encryptedProofMetadata, encryptedSymmetricKey, encryptedProofMetadataAES) {
  try {
    window.localStorage.setItem('holoEncryptedProofMetadata', encryptedProofMetadata)
    window.localStorage.setItem('holoProofMetadataSymmetricKey', encryptedSymmetricKey)
    window.localStorage.setItem('holoEncryptedProofMetadataAES', encryptedProofMetadataAES)
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export function getLocalProofMetadata() {
  const localSigDigest = window.localStorage.getItem('holoSigDigest');
  const localEncryptedProofMetadataLit = window.localStorage.getItem('holoEncryptedProofMetadata'); // for backwards compatibility with version that uses Lit
  const localEncryptedSymmetricKeyLit = window.localStorage.getItem('holoProofMetadataSymmetricKey'); // for backwards compatibility with version that uses Lit
  const localEncryptedProofMetadataAES = window.localStorage.getItem('holoEncryptedProofMetadataAES')
  const varsAreDefined = localSigDigest && localEncryptedProofMetadataLit && localEncryptedSymmetricKeyLit;
  const varsAreUndefinedStr = localSigDigest === 'undefined' || localEncryptedProofMetadataLit === 'undefined' || localEncryptedSymmetricKeyLit === 'undefined'
  if (varsAreDefined && !varsAreUndefinedStr) {
      console.log('Found proof metadata in localStorage')
      return {
        sigDigest: localSigDigest,
        encryptedProofMetadata: localEncryptedProofMetadataLit,
        encryptedSymmetricKey: localEncryptedSymmetricKeyLit,
        encryptedProofMetadataAES: localEncryptedProofMetadataAES
      }
  }
  console.log('Did not find proof metadata in localStorage')
}

export async function getProofMetadata(holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig, restore = false) {
  // 1. Get local proof metadata
  const localProofMetadata = getLocalProofMetadata();
  // 2. Get remote proof metadata
  const resp = await fetch(`${idServerUrl}/proof-metadata?sigDigest=${holoAuthSigDigest}`);
  if (resp.status !== 200) throw new Error((await resp.json()).error);
  const remoteProofMetadata = await resp.json();
  // 3. If Lit-encrypted proof metadata is present, decrypt it
  let proofMetadataArrLit = [];
  if (localProofMetadata?.encryptedProofMetadata) {
    proofMetadataArrLit = await decryptObjectWithLit(
      localProofMetadata.encryptedProofMetadata,
      localProofMetadata.encryptedSymmetricKey,
      litAuthSig
    ) ?? [];
  }
  if (remoteProofMetadata?.encryptedProofMetadata) {
    const remoteProofMetadataArrLit = await decryptObjectWithLit(
      remoteProofMetadata.encryptedProofMetadata,
      remoteProofMetadata.encryptedSymmetricKey,
      litAuthSig
    ) ?? [];
    proofMetadataArrLit = proofMetadataArrLit.concat(remoteProofMetadataArrLit);
  }
  // 4. If AES-encrypted proof metadata is present, decrypt it
  let proofMetadataArrAES = [];
  if (
    localProofMetadata?.encryptedProofMetadataAES && 
    localProofMetadata?.encryptedProofMetadataAES !== 'undefined' && 
    localProofMetadata?.encryptedProofMetadataAES !== 'null'
  ) {
    proofMetadataArrAES = decryptWithAES(
      localProofMetadata.encryptedProofMetadataAES,
      holoKeyGenSigDigest
    ) ?? [];
  }
  if (
    remoteProofMetadata?.encryptedProofMetadataAES && 
    remoteProofMetadata?.encryptedProofMetadataAES !== 'undefined' && 
    remoteProofMetadata?.encryptedProofMetadataAES !== 'null'
  ) {
    const remoteProofMetadataArrAES = decryptWithAES(
      remoteProofMetadata.encryptedProofMetadataAES,
      holoKeyGenSigDigest
    ) ?? [];
    proofMetadataArrAES = proofMetadataArrAES.concat(remoteProofMetadataArrAES);
  }
  // 5. Merge local and remote proof metadata
  const mergedProofMetadata = [];
  for (const item of proofMetadataArrLit.concat(proofMetadataArrAES)) {
    if (!mergedProofMetadata.find(i => i?.txHash === item?.txHash)) {
      mergedProofMetadata.push(item);
    }
  }
  // 6. Store merged proof metadata in localStorage and remote backup in case there is a difference between local and remote
  if (mergedProofMetadata.length > 0 && restore) {
    // encrypt mergedProofMetadata with Lit
    const encryptedProofMetadataLit = await encryptObjectWithLit(mergedProofMetadata, litAuthSig);
    // encrypt mergedProofMetadata with AES
    const encryptedProofMetadataAES = encryptWithAES(mergedProofMetadata, holoKeyGenSigDigest);
    setLocalEncryptedProofMetadata(
      encryptedProofMetadataLit?.encryptedString,
      encryptedProofMetadataLit?.encryptedSymmetricKey,
      encryptedProofMetadataAES
    );
    try {
      console.log('sending proof metadata to remote backup')
      // Ignore errors that occur here so that we can return the proof metadata
      const resp2 = await fetch(`${idServerUrl}/proof-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sigDigest: holoAuthSigDigest,
          encryptedProofMetadata: encryptedProofMetadataLit?.encryptedString,
          encryptedSymmetricKey: encryptedProofMetadataLit?.encryptedSymmetricKey,
          encryptedProofMetadataAES: encryptedProofMetadataAES
        })
      });
      if (resp2.status !== 200) throw new Error((await resp2.json()).error);
    } catch (err) {
      console.log(err)
    }
  }
  return mergedProofMetadata;
}

export function generateSecret() {
  const newSecret = new Uint8Array(64);
  crypto.getRandomValues(newSecret);
  const primeAsBigNum = ethers.BigNumber.from(zokratesFieldPrime)
  return ethers.BigNumber.from(newSecret).mod(primeAsBigNum).toHexString();
}
