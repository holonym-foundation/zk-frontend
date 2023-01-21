/**
 * Simple provider component & hook to store the Holo KeyGen sig (and sigDigest) in 
 * context so that it doesn't have to be passed as props to every component
 */
import React, { createContext, useContext, useMemo } from 'react'
import { useSignMessage } from 'wagmi';
import { useLocalStorage } from 'usehooks-ts'
import { sha256 } from '../utils/secrets';
import { holonymKeyGenMessage } from "../constants/misc";

const HoloKeyGenSigContext = createContext(null)

function HoloKeyGenSigProvider({ children }) {
  const [holoKeyGenSig, setHoloKeyGenSig] = useLocalStorage('holoKeyGenSig', null)
  const [holoKeyGenSigDigest, setHoloKeyGenSigDigest] = useLocalStorage('holoKeyGenSigDigest', null)
  // Using useLocalStorage on strings results in double quotes being added to the ends of the strings
  const parsedHoloKeyGenSig = useMemo(
    () => holoKeyGenSig?.replaceAll('"', ''),
    [holoKeyGenSig]
  )
  const parsedHoloKeyGenSigDigest = useMemo(
    () => holoKeyGenSigDigest?.replaceAll('"', ''),
    [holoKeyGenSigDigest]
  )
  const {
    data: signedKeyGenMessage,
    isError: holoKeyGenSigIsError,
    isLoading: holoKeyGenSigIsLoading,
    isSuccess: holoKeyGenSigIsSuccess, 
    signMessageAsync
  } = useSignMessage({ message: holonymKeyGenMessage })

  async function signHoloKeyGenMessage() {
    console.log('requesting holoKeyGenSig')
    const signedMessage = await signMessageAsync();
    setHoloKeyGenSig(signedMessage)
    const digest = await sha256(signedMessage);
    setHoloKeyGenSigDigest(digest)
  }

  return (
    <HoloKeyGenSigContext.Provider value={{
      signHoloKeyGenMessage,
      holoKeyGenSigIsError,
      holoKeyGenSigIsLoading,
      holoKeyGenSigIsSuccess,
      holoKeyGenSig: parsedHoloKeyGenSig,
      holoKeyGenSigDigest: parsedHoloKeyGenSigDigest,
    }}>
      {children}
    </HoloKeyGenSigContext.Provider>
  )
}

// Helper hook to access the provider values
const useHoloKeyGenSig = () => useContext(HoloKeyGenSigContext)

export { HoloKeyGenSigProvider, useHoloKeyGenSig }
