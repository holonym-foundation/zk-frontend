import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Chains } from '@rize-labs/banana-wallet-sdk/dist/Constants';
import { Banana } from "@rize-labs/banana-wallet-sdk/dist/BananaProvider"
// import useAccountConnectGate from "./useAccountConnectGate";

export default function AccountConnectGate({ children, fallback, gate }) {
  // TODO: Move banana wallet stuff into wallet component. This is just for testing
  const [walletName, setWalletName] = useState('')
  const [isWalletNameUnique, setIsWalletNameUnique] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [AAProvider, setAAProvider] = useState('')

	useEffect(() => {
		(async () => {
			// TODO: Move banana wallet stuff into wallet component. This is just for testing
			// try {
				const jsonRpcProviderUrl = 'https://rpc.ankr.com/eth_goerli'
				const bananaInstance = new Banana(Chains.goerli, jsonRpcProviderUrl);
				// const walletNameTemp = bananaInstance.getWalletName()
				// setWalletName(walletNameTemp)
				const walletNameTemp = 'random-unique-wallet-name';
				console.log('walletNameTemp', walletNameTemp)
				const isWalletNameUniqueTemp = bananaInstance.isWalletNameUnique(walletNameTemp)
				setIsWalletNameUnique(isWalletNameUniqueTemp)
				const walletAddressTemp = await bananaInstance.getWalletAddress(walletNameTemp)
				console.log('walletAddressTemp', walletAddressTemp)
				setWalletAddress(walletAddressTemp)
				const AAProviderTemp = await bananaInstance.getAAProvider(walletAddressTemp)
				console.log('AAProviderTemp', AAProviderTemp)
				setAAProvider(AAProviderTemp)
				const signer = AAProviderTemp.getSigner();
				console.log('signer', signer)
				// const signer = AAProviderTemp.signer;
				const signature = await bananaInstance.signMessage('hello world')
				const sig = signature.signature;
				console.log('signature', signature)
			// } catch (err) {
			//   console.log('errr', err)
			// }
		})();
	}, [])

      // {/* TODO: Displaying this banana wallet stuff is just for testing. Delete it. */}
      // <div style={{ margin: '20px', color: '#fff' }}>
      //   <h1>Banana wallet stuff</h1>
      //   <p>walletName: {walletName}</p>
      //   <p>isWalletNameUnique: {isWalletNameUnique ? 'true' : 'false'}</p>
      //   <p>JSON.stringify(walletAddress): {JSON.stringify(walletAddress ?? {})}</p>
      //   {/* <p>JSON.stringify(AAProvider): {JSON.stringify(AAProvider)}</p> */}
      // </div>

	// const isGateOpen = useAccountConnectGate(gate);
	const { data: account } = useAccount();
	const isGateOpen = gate({ account });
	if (isGateOpen) {
		return <>{children}</>;
	}
	return fallback;
}
