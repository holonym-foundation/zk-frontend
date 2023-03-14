/**
 * Hook that wraps wagmi's useAccount hook and some Banana wallet functionality.
 */
import React, { useState, useEffect } from 'react';
import { Chains } from '@rize-labs/banana-wallet-sdk/dist/Constants';
import { Banana } from '@rize-labs/banana-wallet-sdk/dist/BananaProvider';
import { useSessionStorage } from 'usehooks-ts';

export default function useBananaWallet() {
  const [bananaInstance, setBananaInstance] = useState(null);
  const [walletName, setWalletName] = useSessionStorage('bananaWalletName', '');
  const [isWalletNameUnique, setIsWalletNameUnique] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [aaProvider, setAAProvider] = useState(null);

  useEffect(() => {
    if (bananaInstance && walletName) {
      (async () => {
        const isWalletNameUniqueTemp = bananaInstance.isWalletNameUnique(walletName);
        setIsWalletNameUnique(isWalletNameUniqueTemp);
        const walletAddressTemp = await bananaInstance.getWalletAddress(walletName);
        setWalletAddress(walletAddressTemp);
        const aaProviderTemp = await bananaInstance.getAAProvider(walletAddressTemp);
        setAAProvider(aaProviderTemp);
      })();
    }
  }, [bananaInstance, walletName])

	useEffect(() => {
		(async () => {
      const jsonRpcProviderUrl = 'https://rpc.ankr.com/eth_goerli'
      const bananaInstanceTemp = new Banana(Chains.goerli, jsonRpcProviderUrl);
      setBananaInstance(bananaInstanceTemp)
      // // const walletNameTemp = bananaInstanceTemp.getWalletName()
      // // setWalletName(walletNameTemp)
      // const walletNameTemp = 'random-unique-wallet-name';
      // console.log('walletNameTemp', walletNameTemp)
      // const isWalletNameUniqueTemp = bananaInstanceTemp.isWalletNameUnique(walletNameTemp)
      // setIsWalletNameUnique(isWalletNameUniqueTemp)
      // const walletAddressTemp = await bananaInstanceTemp.getWalletAddress(walletNameTemp)
      // console.log('walletAddressTemp', walletAddressTemp)
      // setWalletAddress(walletAddressTemp)
      // const AAProviderTemp = await bananaInstanceTemp.getAAProvider(walletAddressTemp)
      // console.log('AAProviderTemp', AAProviderTemp)
      // setAAProvider(AAProviderTemp)
      // const signer = AAProviderTemp.getSigner();
      // console.log('signer', signer)
      // // const signer = AAProviderTemp.signer;
      // const signature = await bananaInstanceTemp.signMessage('hello world')
      // const sig = signature.signature;
      // console.log('signature', signature)
		})();
	}, [])

  return {
    bananaInstance,
    walletName,
    setWalletName,
    isWalletNameUnique,
    walletAddress,
    aaProvider,
  }
}
