import { useState, useEffect, useRef } from "react";
import {
  generateSecret,
} from "../../utils/secrets";
import { createLeaf } from "../../utils/proofs";
import {
  IssuedCredentialBase,
} from "../../types";

// This function:
// - Must add a new secret (and newLeaf and serializedAsNewPreimage) to credentials.
// - Cannot add the same secret to credentials from different retrieval endpoints.
// - Cannot add the same secret to credentials from the same issuer retrieved at a different time.
// - Must add THE SAME new secret to credentials in case of a re-render or refresh where the user
//   is in the same issuance session. TODO: How can we demarcate an issuance session?
function useAddNewSecret({
  retrievalEndpoint,
  newCreds,
}: {
  retrievalEndpoint?: string;
  newCreds?: IssuedCredentialBase;
}) {
  const newSecretRef = useRef<string>();
  // const [newSecret, setNewSecret] = useSessionStorage(`holoNewSecret-${retrievalEndpoint}`, undefined);
  const [newCredsWithNewSecret, setNewCredsWithNewSecret] =
    useState<IssuedCredentialBase>();

  // Since a useEffect with an empty dependency array is only called once and is run
  // synchronously, we can use it to set the new secret without worrying about a re-render
  // or refresh causing one "thread" to set one secret and another "thread" to set a different
  // secret.
  useEffect(() => {
    // We assume the user will not need to retrieve credentials multiple times--for different
    // leaves--from the same issuer during the same browser session, so we are safe to use
    // sessionStorage to store the new secret.
    const storedSecret = sessionStorage.getItem(
      `holoNewSecret-${retrievalEndpoint}`
    );
    if (storedSecret) {
      newSecretRef.current = storedSecret;
    } else {
      newSecretRef.current = generateSecret();
      sessionStorage.setItem(
        `holoNewSecret-${retrievalEndpoint}`,
        newSecretRef.current
      );
    }
  }, [retrievalEndpoint]);

  // Since newSecret is set synchronously and for the whole user session upon the rendering
  // of this component, we don't have to worry about how many times this useEffect is called.
  useEffect(() => {
    if (!(retrievalEndpoint && newCreds && newSecretRef.current)) return;
    (async () => {
      try {
        const credsTemp = { ...newCreds };
        credsTemp.creds.newSecret = newSecretRef.current!;
        credsTemp.creds.serializedAsNewPreimage = [
          ...credsTemp.creds.serializedAsPreimage,
        ];
        credsTemp.creds.serializedAsNewPreimage[1] = credsTemp.creds.newSecret;
        credsTemp.newLeaf = (await createLeaf(
          credsTemp.creds.serializedAsNewPreimage
        )) as string;
        setNewCredsWithNewSecret(credsTemp);
      } catch (err) {
        console.error("useAddNewSecret:", err);
      }
    })();
  }, [retrievalEndpoint, newCreds, newSecretRef]);

  return {
    newCredsWithNewSecret,
  };
}

export default useAddNewSecret;
