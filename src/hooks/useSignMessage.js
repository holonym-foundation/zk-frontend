/**
 * Hook that wraps wagmi's useSignMessage hook and some Banana wallet functionality.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { 
  useSignMessage as useWagmiSignMessage, 
  useAccount as useWagmiAccount 
} from 'wagmi';
import useBananaWallet from './useBananaWallet';

export default function useSignMessage({ message }) {
  const { data: wagmiAccount } = useWagmiAccount();
  const { 
    data: wagmiSignature,
    isError: wagmiIsError,
    isLoading: wagmiIsLoading,
    isSuccess: wagmiIsSuccess,
    signMessageAsync: wagmiSignMessageAsync
  } = useWagmiSignMessage({ message });
  const { 
    bananaInstance, 
    walletAddress: bananaWalletAddress,
    aaProvider: bananaWalletAAProvider 
  } = useBananaWallet();
  const usingWagmi = useMemo(
    () => !!wagmiAccount?.address && !!wagmiAccount?.connector, 
    [wagmiAccount]
  );
  const usingBanana = useMemo(
    () => !!bananaWalletAddress && !!bananaWalletAAProvider, 
    [bananaWalletAddress, bananaWalletAAProvider]
  );
  const [signature, setSignature] = useState(null);
  const [bananaIsError, setBananaIsError] = useState(false);
  const [bananaIsLoading, setBananaIsLoading] = useState(false);
  const [bananaIsSuccess, setBananaIsSuccess] = useState(false);

  async function signMessageAsync() {
    if (usingWagmi) {
      const sig = await wagmiSignMessageAsync();
      setSignature(sig);
      return sig;
    } else if (usingBanana) {
      try {
        setBananaIsLoading(true);
        const sigObject = await bananaInstance.signMessage(message);
        setSignature(sigObject.signature);
        setBananaIsSuccess(true);
        return sigObject.signature;
      } catch (err) {
        console.error(err);
        setBananaIsError(true);
        throw err;
      } finally {
        setBananaIsLoading(false);
      }
    }
  }

  return {
    data: signature ?? wagmiSignature,
    isError: wagmiIsError || bananaIsError,
    isLoading: wagmiIsLoading || bananaIsLoading,
    isSuccess: wagmiIsSuccess || bananaIsSuccess,
    signMessageAsync
  }
}
