/**
 * Simple provider component & hook to store the Lit auth sig in context so that it 
 * doesn't have to be passed as props to every component
 */
import React, { createContext, useContext } from 'react'
import { useAccount, useSignMessage } from 'wagmi';
import { chainIdUsedForLit } from "../constants/misc";
import { createSiweMessage } from "../utils/misc";

const LitAuthSigContext = createContext(null)

function LitAuthSigProvider({ children }) {
  const { data: account } = useAccount();
  const {
    data: signedAuthMessage,
    isError: holoAuthSigIsError,
    isLoading: holoAuthSigIsLoading,
    isSuccess: holoAuthSigIsSuccess, 
    signMessageAsync
  } = useSignMessage()

  function getLitAuthSig() {
    const authSig = window.localStorage.getItem('lit-auth-signature');
    return authSig ? JSON.parse(authSig) : null;
  }

  async function signLitAuthMessage() {
    if (!account?.address) return;
    const message = createSiweMessage(account.address, "", chainIdUsedForLit.toString())
    const signature = await signMessageAsync({ message: message });
    const authSigTemp = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: message,
      address: account.address
    }
    window.localStorage.setItem('lit-auth-signature', JSON.stringify(authSigTemp))
    return authSigTemp
  }

  return (
    <LitAuthSigContext.Provider value={{ getLitAuthSig, signLitAuthMessage }}>
      {children}
    </LitAuthSigContext.Provider>
  )
}

// Helper hook to access the provider values
const useLitAuthSig = () => useContext(LitAuthSigContext)

export { LitAuthSigProvider, useLitAuthSig }
