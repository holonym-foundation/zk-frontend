import { useState, useEffect } from "react";
import { ethers } from "ethers";
import PrivateInfoCard from "./PrivateInfoCard";
import PublicInfoCard from "./PublicInfoCard";
import {
  primeToCountryCode,
  serverAddress,
  tokenIdToMedSpecialty,
} from "../../constants";
import { useCreds } from "../../context/Creds";
import {
  SortedCreds,
  IssuedCredentialBase,
  IssuedCredentialMetadata,
} from "../../types";

type FormattedCreds = {
  [credName: string]: {
    issuer: string;
    cred: string;
    iat?: string;
  };
};

const credsFieldsToIgnore = [
  "completedAt",
  "issuer",
  "newSecret",
  "secret",
  "signature",
];

/**
 * Convert sortedCreds into object with shape { [credName]: { issuer: string, cred: string, completedAt: string } }
 */
function formatCreds(sortedCreds: SortedCreds) {
  // Note: This flattening approach assumes two issuers will never provide the same field.
  // For example, only one issuer will ever provide a 'firstName' field.
  const reshapedCreds: FormattedCreds = {};
  Object.entries(sortedCreds)
    .reduce((acc: FormattedCreds[], [issuer, cred]) => {
      // Handle gov id creds
      const rawCreds =
        sortedCreds[issuer]?.metadata?.rawCreds ??
        sortedCreds[issuer]?.metadata ??
        {};
      const newCreds = Object.entries(rawCreds)
        .filter(([credName, credValue]) => credName !== "completedAt")
        .map(([credName, credValue]) => {
          const secondsSince1900 =
            parseInt(
              ethers.BigNumber.from(
                sortedCreds[issuer]?.creds?.iat ?? 2208988800
              ).toString()
            ) *
              1000 -
            2208988800000;
          return {
            [credName]: {
              issuer,
              cred: credValue,
              iat: secondsSince1900
                ? new Date(secondsSince1900).toISOString().slice(0, 10)
                : undefined,
            },
          };
        });
      return [...acc, ...newCreds];
    }, [])
    .forEach((cred) => {
      const [credName, credValue] = Object.entries(cred)[0];
      reshapedCreds[credName] = credValue;
    });
  const filteredCreds = Object.fromEntries(
    Object.entries(reshapedCreds).filter(([fieldName, value]) => {
      return !credsFieldsToIgnore.includes(fieldName);
    })
  );
  const formattedCreds = Object.fromEntries(
    Object.entries(filteredCreds).map(([fieldName, value]) => {
      if (fieldName === "countryCode") {
        return [
          "Country",
          {
            ...value,
            // @ts-ignore
            cred: primeToCountryCode[value.cred],
          },
        ];
      } else if (fieldName === "npiNumber") {
        return ["NPI Number", value];
      } else if (
        fieldName === "specialty" &&
        value.issuer === serverAddress["med"]
      ) {
        return [
          "Medical Specialty",
          {
            ...value,
            // @ts-ignore
            cred: tokenIdToMedSpecialty[value.cred],
          },
        ];
      } else {
        let formattedFieldName = fieldName.replace(/([A-Z])/g, " $1");
        formattedFieldName =
          formattedFieldName.charAt(0).toUpperCase() +
          formattedFieldName.slice(1);
        return [formattedFieldName, value];
      }
    })
  );
  // Handle phone number creds
  const phoneNumber =
    sortedCreds[serverAddress["phone-v2"]]?.creds?.customFields[0];
  if (phoneNumber) {
    const secondsSince1900 =
      parseInt(
        ethers.BigNumber.from(
          sortedCreds[serverAddress["phone-v2"]]?.creds?.iat ?? 2208988800
        ).toString()
      ) *
        1000 -
      2208988800000;
    formattedCreds["Phone Number"] = {
      issuer: serverAddress["phone-v2"],
      cred: phoneNumber
        ? ethers.BigNumber.from(phoneNumber).toString()
        : undefined,
      iat: secondsSince1900
        ? new Date(secondsSince1900).toISOString().slice(0, 10)
        : undefined,
    };
  }
  return formattedCreds;
}

export default function Profile() {
  const [formattedCreds, setFormattedCreds] = useState<FormattedCreds>();
  const { sortedCreds, loadingCreds } = useCreds();

  useEffect(() => {
    if (loadingCreds || !sortedCreds) return;
    const formattedCreds = formatCreds(sortedCreds);
    setFormattedCreds(formattedCreds);
  }, [sortedCreds, loadingCreds]);

  return (
    <>
      <div className="x-section wf-section">
        <div className="x-container dashboard w-container">
          <PublicInfoCard />
          <div className="spacer-large" />
          <PrivateInfoCard creds={formattedCreds} loading={loadingCreds} />
        </div>
      </div>
    </>
  );
}
