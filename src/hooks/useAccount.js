/**
 * Hook that wraps wagmi's useAccount hook and some Banana wallet functionality.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useAccount as useWagmiAccount } from 'wagmi';
import useBananaWallet from './useBananaWallet';

export default function useAccount() {
  const { data: wagmiAccount, refetch } = useWagmiAccount();
  const { walletAddress, aaProvider } = useBananaWallet();

  const account = useMemo(() => {
    return {
      address: wagmiAccount?.address ?? walletAddress,
      // For Banana wallet, we set connector to a boolean because we don't use the
      // connector for anything other than checking whether the wallet is connected.
      connector: wagmiAccount?.connector ?? !!aaProvider,
    }
  }, [wagmiAccount, walletAddress, aaProvider])

  return {
    data: account,
    refetch: refetch ?? (() => {}),
  }
}
