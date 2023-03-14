/**
 * Hook that wraps wagmi's useAccount hook and some Banana wallet functionality.
 */
import React, { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

export default function useAccountWrapper() {
  // wagmi
  const { data: wagmiAccount, refetch } = useAccount();
  // Banana wallet
  // const [walletName, setWalletName] = useState('')
  // const [isWalletNameUnique, setIsWalletNameUnique] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [AAProvider, setAAProvider] = useState('')

  const account = useMemo(() => {
    return {
      address: wagmiAccount?.address ?? walletAddress,
      // For Banana wallet, we set connector to a boolean because we don't use the
      // connector for anything other than checking whether the wallet is connected.
      connector: wagmiAccount?.connector ?? !!AAProvider,
    }
  }, [wagmiAccount, walletAddress, AAProvider])

  return {
    data: account,
    refetch: refetch ?? (() => {}),
  }
}
