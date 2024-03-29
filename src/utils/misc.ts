import { SiweMessage } from "siwe";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { 
  PRICE_USD,
  PHONE_PRICE_USD,
  PAYMENT_MARGIN_OF_ERROR_AS_PERCENT,
} from "../constants";
import { IdServerSessionsResponse, PhoneServerSessionsResponse, Currency } from '../types'

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

export async function getIDVProvider(ip?: string, country?: string) {
  return "veriff"
  // if (country === "Bangladesh") {
  //   return "veriff"
  // }
  // return "onfido";

  // if (!ip) return "veriff";

  // const defaultOptions = ["veriff", "onfido"];
  // // const allOptions = ["veriff", "idenfy", "onfido"];
  // // const onfidoIdenfy = ["onfido", "idenfy"];
  // const onfido = ["onfido"]

  // const exceptions = {
  //   Japan: {
  //     options: onfido,
  //   },
  //   China: {
  //     options: onfido,
  //   },
  //   "Hong Kong": {
  //     options: onfido,
  //   },
  //   Iran: {
  //     options: defaultOptions,
  //   },
  //   Russia: {
  //     options: defaultOptions,
  //   },
  //   Bangladesh: {
  //     options: defaultOptions,
  //   },
  //   Nigeria: {
  //     options: defaultOptions,
  //   },
  //   "South Korea": {
  //     options: defaultOptions,
  //   },
  // };

  // const options =
  //   exceptions[country as keyof typeof exceptions]?.options ?? defaultOptions;
  // const ipcoin = ethers.BigNumber.from("0x" + (await sha1String(ip)))
  //   .mod(options.length)
  //   .toNumber();
  // return options[ipcoin];
}

/**
 * Returns path to an IDV session or undefined, given idvServerSessions.
 */
export function getIDVSessionPath(idServerSessions?: IdServerSessionsResponse) {
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

export function getPhoneSessionPath(phoneServerSessions?: PhoneServerSessionsResponse) {
  // TODO: Each of the following if statements assumes the first item in the
  // array will always be the correct one to use. It's possible, though unlikely,
  // for cases to arise where this assumption doesn't hold. We should rewrite
  // this to handle all possible cases.
  if (Array.isArray(phoneServerSessions) && phoneServerSessions.length > 0) {
    // If user has already paid for a session but hasn't completed verification,
    // direct them to the page where they can start verification.
    const inProgressSessions = phoneServerSessions.filter(
      (session) => session.sessionStatus.S === "IN_PROGRESS" && session?.numAttempts?.N <= 3
    );
    if (inProgressSessions.length > 0) {
      return `/issuance/phone-verify?sid=${inProgressSessions[0].id.S}`
    }

    // If the user has already initiated a session but hasn't paid for it,
    // direct them to the page where they can pay for the session.
    const needsPaymentSessions = phoneServerSessions.filter(
      (session) => session.sessionStatus.S === "NEEDS_PAYMENT"
    );
    if (needsPaymentSessions.length > 0) {
      return `/issuance/phone-verify?sid=${needsPaymentSessions[0].id.S}`
    }
  }
}

export function calculateIDVPrice(tokenPrice: number) {
  return PRICE_USD.div(BigNumber(tokenPrice)).multipliedBy(
    PAYMENT_MARGIN_OF_ERROR_AS_PERCENT.plus(1)
  )
}

export function calculatePhonePrice(tokenPrice: number) {
  return PHONE_PRICE_USD.div(BigNumber(tokenPrice)).multipliedBy(
    PAYMENT_MARGIN_OF_ERROR_AS_PERCENT.plus(1)
  )
}
