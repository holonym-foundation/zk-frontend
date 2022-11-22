/**
 * Simple provider component & hook to store the Lit auth sig in context so that it 
 * doesn't have to be passed as props to every component
 */
import React, { createContext, useContext, useState } from 'react'

const LitAuthSigContext = createContext(null)

function LitAuthSigProvider({ children }) {
  const [litAuthSig, setLitAuthSig] = useState()

  return (
    <LitAuthSigContext.Provider value={{ litAuthSig, setLitAuthSig }}>
      {children}
    </LitAuthSigContext.Provider>
  )
}

// Helper hook to access the provider values
const useLitAuthSig = () => useContext(LitAuthSigContext)

export { LitAuthSigProvider, useLitAuthSig }
