import { SiweMessage } from "siwe";
import { ethers } from "ethers";
import { IdServerSessionsResponse, Currency } from '../types'

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

/**
 * Returns path to an IDV session or undefined, given idvServerSessions.
 */
export function getSessionPath(idServerSessions?: IdServerSessionsResponse) {
  // TODO: Each of the following if statements assumes the first item in the
  // array will always be the correct one to use. It's possible, though unlikely,
  // for cases to arise where this assumption doesn't hold. We should rewrite
  // this to handle all possible cases.
  if (Array.isArray(idServerSessions) && idServerSessions.length > 0) {
    // If user has already paid for a session but hasn't completed verification,
    // direct them to the page where they can start verification.
    const inProgressSessions = idServerSessions.filter(
      (session) => session.status === "IN_PROGRESS"
    );
    if (inProgressSessions.length > 0) {
      const provider = inProgressSessions[0].idvProvider;
      return `/issuance/idgov-${provider}?sid=${inProgressSessions[0]._id}`
    }

    // If the user has already initiated a session but hasn't paid for it,
    // direct them to the page where they can pay for the session.
    const needsPaymentSessions = idServerSessions.filter(
      (session) => session.status === "NEEDS_PAYMENT"
    );
    if (needsPaymentSessions.length > 0) {
      const provider = needsPaymentSessions[0].idvProvider;
      return `/issuance/idgov-${provider}?sid=${needsPaymentSessions[0]._id}`
    }
  }
}

export const fetchMintBondPrice = async (c: Currency): Promise<number> => {
  const priceData = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${c.coinGeckoName}&vs_currencies=USD`
  );
  if (priceData.status !== 200) {
    throw new Error("Failed to fetch price");
  } else {
    return (await priceData.json())[c.coinGeckoName].usd;
  }
};
