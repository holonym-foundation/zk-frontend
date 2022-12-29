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
    if (!account?.address) throw new Error('No address found');
    const message = createSiweMessage(account.address, "", chainIdUsedForLit.toString())
    const signature = await signMessageAsync({ message: message });
    const authSigTemp = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: message,
      address: account.address
    }
    // const authSigTemp = {
    //   sig: "0x18720b54cf0d29d618a90793d5e76f4838f04b559b02f1f01568d8e81c26ae9536e11bb90ad311b79a5bc56149b14103038e5e03fee83931a146d93d150eb0f61c",
    //   derivedVia: "web3.eth.personal.sign",
    //   signedMessage: '"localhost:3002 wants you to sign in with your Ethereum account:\n0x27c497C4fE4913f422C2ff3cb0952534Dc3D3E7c\n\n\nURI: http://localhost:3002\nVersion: 1\nChain ID: 1\nNonce: 8Hg51JjG1jQSncNPZ\nIssued At: 2022-12-29T18:35:40.228Z"',
    //   address: "0x27c497c4fe4913f422c2ff3cb0952534dc3d3e7c"
    // }
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
