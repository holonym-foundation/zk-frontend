import { configureChains, createConfig } from 'wagmi'
import { optimism, optimismGoerli } from '@wagmi/core/chains'
import { publicProvider } from '@wagmi/core/providers/public'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { desiredChainId } from "./constants";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [desiredChainId === optimismGoerli.id ? optimismGoerli : optimism],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY ?? '' }), 
    publicProvider()
  ],
)
  
const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    new InjectedConnector({ chains }),
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({ 
        options: {
        appName: 'holonym',
        // jsonRpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/yourAlchemyId',
        },
    })
  ]
})

export default config
