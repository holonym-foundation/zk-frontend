import React from "react";
// import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { desiredChainId } from "./constants/desiredChain";
import { Provider, createClient } from "wagmi";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { InjectedConnector } from "wagmi/connectors/injected";

// Set up wagmi connectors
const client = createClient({
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

      new WalletConnectConnector({
        options: {
          qrcode: true,
        },
      }),
    ];
  },
});

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <Provider client={client}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
