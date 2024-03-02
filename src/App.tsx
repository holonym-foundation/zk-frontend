import "./App.css";
import "./normalize.css";
import "./webflow.css";
import "./holo-wtf.webflow.css";
import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import WebFont from "webfontloader";
import LoadingElement from "./components/loading-element";
import { isMobile } from "react-device-detect";
import RoundedWindow from "./components/RoundedWindow";
import ConnectWalletScreen from "./components/atoms/connect-wallet-screen";
import SwitchChains from './components/atoms/SwitchChains'
import { RootProvider } from "./RootProvider";
import { Layout } from "./Layout";
import { AppRoutes } from "./AppRoutes";
import useScriptWithURL from "./hooks/useScriptWithURL";
import { init } from "./utils/datadog";

// Analytics. They shouldn't tracking anything sensitive and shouldn't be used to perform any individual analysis / targeting, primarly just for aggregate statistics to understand our users
// and understanding why errors might be happening.
init();

const NotDesktop = () => (
  <div style={{ margin: '10px' }}>
    {/* <h1>Please make sure you're on a desktop or laptop computer.</h1>
    <h5>Mobile and other browsers aren't supported in the beta version</h5> */}

    <p style={{ color: '#fff', fontSize: '16px' }}>
      If you are on mobile, please use Holonym v3. The legacy Holonym app is experimental technology that pushed the boundaries of ZK identity.{' '}
      It was not designed to handle massive numbers of daily new users. We&#39;ve upgraded Holonym to{' '}
      be 10x+ faster. We strongly recommend using Holonym v3 for a fast, easy, and bug-free experience. 
    </p>

    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
      <a
        href="https://silksecure.net/holonym/diff-wallet"
        target="_blank"
        rel="noreferrer"
        className="x-button primary"
      >
        Verify Now Quickly and Easily
      </a>
    </div>

  </div>
)

const ConnectWalletFallback = () => {
  return (
    <Layout>
      <RoundedWindow>
        <ConnectWalletScreen />
      </RoundedWindow>
    </Layout>
  );
}

const NetworkGateFallback = () => {
  return (
    <Layout>
      <RoundedWindow>
        <SwitchChains />
      </RoundedWindow>
    </Layout>
  );
}

const SignMessagesFallback = () => {
  return (
    <Layout>
      <RoundedWindow>
        <div
          style={{
            position: "relative",
            paddingTop: "100px",
            width: "100%",
            height: "90%",
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
            flexDirection: "column",
          }}
        >
          <h2>Please sign the messages in your wallet.</h2>
        </div>
      </RoundedWindow>
    </Layout>
  );
}

function App() {
  useScriptWithURL("https://cdn.usefathom.com/script.js", {"data-site": "SLPDXJMA", defer: true});
  useEffect(() => {
    Promise.all([
      WebFont.load({
        google: {
          families: [
            "Montserrat:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic",
          ],
        },
      }),
    ])
  }, []);

  if (true) return <NotDesktop />
  return (
    <Router>
      <RootProvider
        connectWalletFallback={<ConnectWalletFallback />}
        signMessagesFallback={<SignMessagesFallback />}
        networkGateFallback={<NetworkGateFallback />}
      >
        <Suspense fallback={<LoadingElement />}>
          <Layout>
            <AppRoutes />
          </Layout>
        </Suspense>
      </RootProvider>
    </Router>
  );
}

export default App;
