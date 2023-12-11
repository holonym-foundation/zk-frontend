import { configureChains, createConfig } from 'wagmi'
import { publicProvider } from '@wagmi/core/providers/public'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { InjectedConnector } from '@wagmi/core/connectors/injected'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { allowedChains } from "./constants";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  allowedChains,
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
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: '099565f404cdf2f5885852958c38298a',
        qrModalOptions: {
          themeVariables: {
            '--wcm-z-index': '9999999'
          }
        }
      },
    }),
  ]
})

export default config
