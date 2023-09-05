import { useState, useEffect } from "react";
import { isEqual } from "lodash";
import { issuerWhitelist } from "../../constants";
import {
  IssuedCredentialBase,
  SortedCreds,
  IssuedCredentialMetadata,
} from "../../types";

// This hook MUST NOT set mergedSortedCreds unless the new creds have been confirmed to be stored
// in sortedCreds.
// sortedCreds == user's complete sorted credentials
// newCreds == new creds from the current retrieval endpoint
function useMergeCreds({
  setError,
  sortedCreds,
  loadingCreds,
  newCreds,
}: {
  setError: (error: string | undefined) => void;
  sortedCreds?: SortedCreds;
  loadingCreds?: boolean;
  newCreds?: IssuedCredentialBase;
}) {
  const [confirmationStatus, setConfirmationStatus] = useState("init"); // 'init' | 'confirmed' | 'denied' | 'confirmationRequired'
  const [credsThatWillBeOverwritten, setCredsThatWillBeOverwritten] = useState<
    IssuedCredentialBase & Partial<{ metadata: IssuedCredentialMetadata }>
  >();
  const [mergedSortedCreds, setMergedSortedCreds] = useState<SortedCreds>();

  const onConfirmOverwrite = () => {
    setConfirmationStatus("confirmed");
  };
  const onDenyOverwrite = () => {
    setConfirmationStatus("denied");
  };

  useEffect(() => {
    if (confirmationStatus !== "init") return;
    if (!(loadingCreds || sortedCreds) || loadingCreds) return;
    if (!newCreds?.creds?.issuerAddress) return;
    if (!setError) return;

    const lowerCaseIssuerWhitelist = issuerWhitelist.map((issuer) =>
      issuer.toLowerCase()
    );
    if (
      !lowerCaseIssuerWhitelist.includes(
        newCreds.creds.issuerAddress.toLowerCase()
      )
    ) {
      setError(`Issuer ${newCreds.creds.issuerAddress} is not whitelisted.`);
      return;
    }

    // Ask user for confirmation if they already have credentials from this issuer
    if (sortedCreds?.[newCreds.creds.issuerAddress]) {
      if (
        JSON.stringify(sortedCreds[newCreds.creds.issuerAddress]) ===
        JSON.stringify(newCreds)
      ) {
        // For cases of immediate re-render
        setConfirmationStatus("confirmed");
        return;
      }
      setConfirmationStatus("confirmationRequired");
      setCredsThatWillBeOverwritten(sortedCreds[newCreds.creds.issuerAddress]);
    } else {
      setConfirmationStatus("confirmed");
    }
  }, [sortedCreds, loadingCreds, newCreds, confirmationStatus, setError]);

  useEffect(() => {
    if (
      !(sortedCreds && newCreds?.creds?.issuerAddress) ||
      confirmationStatus !== "confirmed"
    )
      return;

    const mergedSortedCredsTemp = {
      ...sortedCreds,
      [newCreds.creds.issuerAddress]: newCreds,
    };
    if (isEqual(mergedSortedCreds, mergedSortedCredsTemp)) {
      return;
    }
    setMergedSortedCreds(mergedSortedCredsTemp);
  }, [sortedCreds, newCreds, confirmationStatus, mergedSortedCreds]);

  return {
    confirmationStatus,
    credsThatWillBeOverwritten,
    mergedSortedCreds,
    onConfirmOverwrite,
    onDenyOverwrite,
  };
}

export default useMergeCreds;
