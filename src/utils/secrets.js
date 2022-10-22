/**
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
