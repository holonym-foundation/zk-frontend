import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

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
 * @returns {Promise<string>}
 */
export async function sha1String(data) {
  const encodedData = new TextEncoder().encode(data);
  return Array.from(new Uint8Array(await window.crypto.subtle.digest('SHA-1', encodedData)))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getIDVProvider(ip, country) {
  if (!ip) return "veriff"

  const defaultOptions = ["veriff", "onfido"]

  const exceptions = {
    "Japan" : {
      options : ["onfido", "idenfy"]
    },
    // "South Korea" : {
    //   options : ["onfido", "SouthKoreaKYC", "veriff"]
    // },
  }

  const options = exceptions[country]?.options ?? defaultOptions
  const ipcoin = ethers.BigNumber.from(
    '0x' + await sha1String(ip)
  ).mod(options.length).toNumber()
  return options[ipcoin]
}
