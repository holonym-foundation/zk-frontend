import { SiweMessage } from "siwe";
import { ethers } from "ethers";

export function createSiweMessage(
  address: string,
  statement: string,
  chainId: number
) {
  const domain = window.location.host;
  const origin = window.location.origin;
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId,
  });
  return message.prepareMessage();
}

export async function sha1String(data: string) {
  const encodedData = new TextEncoder().encode(data);
  return Array.from(
    new Uint8Array(await window.crypto.subtle.digest("SHA-1", encodedData))
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getIDVProvider(ip: string, country: string) {
  if (!ip) return "veriff";

  const defaultOptions = ["veriff", "onfido"];
  const allOptions = ["veriff", "idenfy", "onfido"];
  const onfidoIdenfy = ["onfido", "idenfy"];

  const exceptions = {
    Japan: {
      options: onfidoIdenfy,
    },
    China: {
      options: onfidoIdenfy,
    },
    "Hong Kong": {
      options: onfidoIdenfy,
    },
    Iran: {
      options: allOptions,
    },
    Russia: {
      options: allOptions,
    },
    Bangladesh: {
      options: allOptions,
    },
    Nigeria: {
      options: allOptions,
    },
    "South Korea": {
      options: allOptions,
    },
  };

  const options =
    exceptions[country as keyof typeof exceptions]?.options ?? defaultOptions;
  const ipcoin = ethers.BigNumber.from("0x" + (await sha1String(ip)))
    .mod(options.length)
    .toNumber();
  return options[ipcoin];
}
