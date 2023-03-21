/**
 * Context provider for creds.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { getCredentials, storeCredentials } from "../utils/secrets";
import { useHoloAuthSig } from './HoloAuthSig';
import { useHoloKeyGenSig } from './HoloKeyGenSig';

const CredsContext = createContext(null);

function CredsProvider({ children }) {
  // TODO: Maybe use a mutex here to prevent multiple places from updating creds at the same time.
  // This is incredibly important at the end of the verification flow when the creds are being updated, and
  // the store-credentials and glowy-green-button components need to have the highest write privileges.
  // OR: Maybe use a hot/cold storage system where the cold storage (i.e., localStorage and remote backup)
  // is only updated infrequently and when we are absolutely sure we want to make the update.
  // OR: Maybe use a mutex and a hot/cold storage system together. Use the mutex for cold storage.
  const [sortedCreds, setSortedCreds] = useSessionStorage('sorted-creds', []);
  const [loadingCreds, setLoadingCreds] = useState(true);
  const { holoAuthSigDigest } = useHoloAuthSig();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();

  const loadCreds = useCallback( async () => {
    setLoadingCreds(true);
    try {
      const sortedCredsTemp = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, false)
      setSortedCreds(sortedCredsTemp);
      setLoadingCreds(false);
      return sortedCredsTemp;
    } catch (error) {
      console.error(error);
      setLoadingCreds(false);
    }
  }, [holoKeyGenSigDigest, holoAuthSigDigest, setSortedCreds]);

  useEffect(() => {
    // TODO: Use useQuery for this so that you only call this function once
    loadCreds();
  }, [loadCreds]);

  async function storeCreds(sortedCreds, kolpProof) {
    const result = await storeCredentials(sortedCreds, holoKeyGenSigDigest, holoAuthSigDigest, kolpProof);
    await loadCreds();
    return result;
  }

  return (
    <CredsContext.Provider value={{
      sortedCreds,
      loadingCreds,
      reloadCreds: loadCreds,
      storeCreds,
    }}>
      {children}
    </CredsContext.Provider>
  )
}

// Helper hook to access the provider values
const useCreds = () => useContext(CredsContext)

export { CredsProvider, useCreds }
