/**
 * Simple provider component & hook to store the Lit auth sig in context so that it 
 * doesn't have to be passed as props to every component
 */
import React, { createContext, useContext } from 'react'
import { useAccount, useSignMessage } from 'wagmi';
import { useLocalStorage } from 'usehooks-ts'
import { chainIdUsedForLit } from "../constants/misc";
import { createSiweMessage } from "../utils/misc";

const LitAuthSigContext = createContext(null)

function LitAuthSigProvider({ children }) {
  const { data: account } = useAccount();
  const [litAuthSig, setLitAuthSig] = useLocalStorage('lit-auth-signature', "")
  const {
    data: signedAuthMessage,
    isError: litAuthSigIsError,
    isLoading: litAuthSigIsLoading,
    isSuccess: litAuthSigIsSuccess, 
    signMessageAsync
  } = useSignMessage()

  async function signLitAuthMessage() {
    if (!account?.address) return;
    console.log('requesting litAuthSig')
    const message = createSiweMessage(account.address, "", chainIdUsedForLit.toString())
    const signature = await signMessageAsync({ message: message });
    const authSigTemp = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: message,
      address: account.address
    }
    setLitAuthSig(authSigTemp);
    return authSigTemp
  }

  function clearLitAuthSig() {
    setLitAuthSig("");
  }

  return (
    <LitAuthSigContext.Provider value={{
      litAuthSig,
      litAuthSigIsError,
      litAuthSigIsLoading,
      litAuthSigIsSuccess,
      signLitAuthMessage,
      clearLitAuthSig
    }}>
      {children}
    </LitAuthSigContext.Provider>
  )
}

// Helper hook to access the provider values
const useLitAuthSig = () => useContext(LitAuthSigContext)

export { LitAuthSigProvider, useLitAuthSig }
