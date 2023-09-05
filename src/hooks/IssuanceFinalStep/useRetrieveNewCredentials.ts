import { useEffect, useRef, useCallback } from "react";
import { useSessionStorage } from "usehooks-ts";
import { IssuedCredentialBase } from "../../types";

// TODO: Low priority: Change retrievalEndpoint s.t. base64 encoding is not necessary. This
// requires changing all places that point to this component, including all issuance flows in
// this repo and in example-issuer.
// const retrievalEndpoint = window.atob(searchParams.get('retrievalEndpoint'))
function useRetrieveNewCredentials({
  setError,
  retrievalEndpoint,
}: {
  setError: (error: string | undefined) => void;
  retrievalEndpoint: string;
}) {
  const [newCreds, setNewCreds] = useSessionStorage<
    IssuedCredentialBase | undefined
  >(`holoNewCredsFromIssuer-${retrievalEndpoint}`, undefined);
  // We use a ref so that retrieveNewCredentials can access the latest value of newCreds without having
  // newCreds as a dependency of retrieveNewCredentials.
  const newCredsRef = useRef(newCreds);

  // TODO: Validate creds before setting newCreds. If creds are invalid, set error, and do
  // not set newCreds.

  const retrieveNewCredentials = useCallback(async () => {
    // We try to fetch before trying to restore from sessionStorage because we want to be
    // 100% sure that we have the latest available credentials. The try-catch around fetch
    // handles cases where fetch fails (e.g., due to network error); in such cases, we still
    // want to check if newCreds are present in sessionStorage.
    let resp = {};
    try {
      resp = await fetch(retrievalEndpoint);
    } catch (err) {
      console.error("useRetrieveNewCredentials:", err);
      // @ts-ignore
      resp.text = () => new Promise((resolve) => resolve(err?.message));
    }
    // @ts-ignore
    if (resp?.status === 200) {
      // @ts-ignore
      const data = await resp.json();
      if (!data) {
        console.error(
          "useRetrieveNewCredentials: Could not retrieve credentials. No credentials found."
        );
        throw new Error(
          "Could not retrieve credentials. No credentials found."
        );
      } else {
        // Storing creds in localStorage at multiple points allows us to restore them in case of a (potentially immediate) re-render
        // window.localStorage.setItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`, JSON.stringify(data))
        return data;
      }
    } else {
      // We only attempt to restore from sessionStorage if the fetch failed.
      if (newCredsRef?.current) {
        return newCredsRef.current;
      }
      // @ts-ignore
      let errMsg = await resp.text();
      console.error(
        "useRetrieveNewCredentials: Retrieval endpoint returned non-200 status code. Response text:",
        errMsg
      );
      if (errMsg?.includes("User has already registered. User ID")) {
        errMsg =
          "It seems you have already tried to verify and create a Holo! " +
          "You can only verify once with an ID. If this is not the case then you may submit a ticket. " +
          "Please include this UUID in the support ticket: " +
          errMsg.split("User ID: ")[1].replace('"}', "");
      }
      // If resp.status is not 200, and if we could not recover from sessionStorage, then the server
      // must have returned an error, which we want to display to the user.
      // TODO: Standardize error messages in servers. Have id-sever and phone server return errors in same format (e.g., { error: 'error message' })
      throw new Error(errMsg);
    }
  }, [retrievalEndpoint]);

  useEffect(() => {
    if (!(retrievalEndpoint && setError)) return;
    setError(undefined);
    retrieveNewCredentials()
      .then((newCredsTemp) => {
        setNewCreds(newCredsTemp);
        newCredsRef.current = newCredsTemp;
      })
      .catch((error) => setError(error.message));
  }, [retrievalEndpoint, retrieveNewCredentials, setError, setNewCreds]);

  return {
    newCreds,
  };
}

export default useRetrieveNewCredentials;
