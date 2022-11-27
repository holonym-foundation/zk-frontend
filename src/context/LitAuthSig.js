/**
 * Simple provider component & hook to store the Lit auth sig in context so that it 
 * doesn't have to be passed as props to every component
 */
import React, { createContext, useContext, useState, useEffect } from 'react'

const LitAuthSigContext = createContext(null)

function LitAuthSigProvider({ children }) {
  const [litAuthSig, setLitAuthSig] = useState()

  useEffect(() => {
    if (litAuthSig) return;
    const fullAuthSig = window.localStorage.getItem('lit-auth-signature')
    if (fullAuthSig) {
      const parsedAuthSig = JSON.parse(fullAuthSig)
      setLitAuthSig(parsedAuthSig)
    }
  }, [])

  return (
    <LitAuthSigContext.Provider value={{ litAuthSig, setLitAuthSig }}>
      {children}
    </LitAuthSigContext.Provider>
  )
}

// Helper hook to access the provider values
const useLitAuthSig = () => useContext(LitAuthSigContext)

export { LitAuthSigProvider, useLitAuthSig }
