import { createClient } from "wagmi";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
// import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { InjectedConnector } from "wagmi/connectors/injected";

// Set up wagmi connectors
export const wagmiClient = createClient({
  autoConnect: true,
  connectors({ chainId }) {
    return [
      new InjectedConnector({}),

      new MetaMaskConnector({}),

      new CoinbaseWalletConnector({
        options: {
          appName: 'holonym',
        },
      }),

      // new WalletConnectConnector({
      //   options: {
      //     qrcode: true,
      //   },
      // }),
    ];
  },
});
