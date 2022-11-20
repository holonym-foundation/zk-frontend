/**
 * Simple provider component & hook to store the Holo auth sig (and sigDigest) in 
 * context so that it doesn't have to be passed as props to every component
 */
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSignMessage } from 'wagmi';
import { sha256 } from '../utils/secrets';
import { holonymAuthMessage } from "../constants/misc";

const HoloAuthSigContext = createContext(null)

function HoloAuthSigProvider({ children }) {
  const [holoAuthSig, setHoloAuthSig] = useState()
  const [holoAuthSigDigest, setHoloAuthSigDigest] = useState()
  const {
    data: signedMessage,
    isError: holoAuthSigIsError,
    isLoading: holoAuthSigIsLoading,
    isSuccess: holoAuthSigIsSuccess, 
    signMessage: signHoloAuthMessage
  } = useSignMessage({ message: holonymAuthMessage })

  useEffect(() => {
    const holoAuthSigFromLocalStorage = window.localStorage.getItem('holoAuthSig')
    if (!holoAuthSig) setHoloAuthSig(holoAuthSigFromLocalStorage)
    const holoAuthSigDigestFromLocalStorage = window.localStorage.getItem('holoSigDigest')
    if (!holoAuthSigDigest) setHoloAuthSigDigest(holoAuthSigDigestFromLocalStorage)
  }, [])

  useEffect(() => {
    (async () => {
      if (!signedMessage) return;
      setHoloAuthSig(signedMessage);
      const digest = await sha256(signedMessage);
      setHoloAuthSigDigest(digest);
    })()
  }, [signedMessage])

  useEffect(() => {
    if (!holoAuthSig) return;
    window.localStorage.setItem('holoAuthSig', holoAuthSig)
  }, [holoAuthSig])
  
  useEffect(() => {
    if (!holoAuthSigDigest) return;
    window.localStorage.setItem('holoSigDigest', holoAuthSigDigest)
  }, [holoAuthSigDigest])

  return (
    <HoloAuthSigContext.Provider value={{
      signHoloAuthMessage,
      holoAuthSig,
      holoAuthSigDigest,
      holoAuthSigIsError,
      holoAuthSigIsLoading,
      holoAuthSigIsSuccess,
    }}>
      {children}
    </HoloAuthSigContext.Provider>
  )
}

// Helper hook to access the provider values
const useHoloAuthSig = () => useContext(HoloAuthSigContext)

export { HoloAuthSigProvider, useHoloAuthSig }
