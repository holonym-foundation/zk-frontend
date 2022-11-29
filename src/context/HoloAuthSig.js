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
  const {
    data: signedAuthMessage,
    isError: holoAuthSigIsError,
    isLoading: holoAuthSigIsLoading,
    isSuccess: holoAuthSigIsSuccess, 
    signMessageAsync
  } = useSignMessage({ message: holonymAuthMessage })

  function getHoloAuthSig() {
    return window.localStorage.getItem('holoAuthSig');
  }

  function getHoloAuthSigDigest() {
    return window.localStorage.getItem('holoSigDigest');
  }

  async function signHoloAuthMessage() {
    const signedMessage = await signMessageAsync();
    window.localStorage.setItem('holoAuthSig', signedMessage)
    const digest = await sha256(signedMessage);
    window.localStorage.setItem('holoSigDigest', digest)
  }

  return (
    <HoloAuthSigContext.Provider value={{
      signHoloAuthMessage,
      holoAuthSigIsError,
      holoAuthSigIsLoading,
      holoAuthSigIsSuccess,
      getHoloAuthSig,
      getHoloAuthSigDigest,
    }}>
      {children}
    </HoloAuthSigContext.Provider>
  )
}

// Helper hook to access the provider values
const useHoloAuthSig = () => useContext(HoloAuthSigContext)

export { HoloAuthSigProvider, useHoloAuthSig }
