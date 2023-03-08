import { SiweMessage } from 'siwe';

export function createSiweMessage(address, statement, chainId) {
  const domain = window.location.host;
  const origin = window.location.origin;
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId
  });
  return message.prepareMessage();
}

/**
 * @param {string} data 
 * @returns {string}
 */
export function sha1String(data) {
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  return Array.from(new Uint8Array(window.crypto.subtle.digest('SHA-1', encodedData)))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}
