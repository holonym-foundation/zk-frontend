import "./App.css";
import "./normalize.css";
import "./webflow.css";
import "./holo-wtf.webflow.css";
import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import WebFont from "webfontloader";
import { Chains } from '@rize-labs/banana-wallet-sdk/dist/Constants';
import { Banana } from "@rize-labs/banana-wallet-sdk/dist/BananaProvider"
import LoadingElement from "./components/loading-element";
import { isMobile } from "react-device-detect";
import RoundedWindow from "./components/RoundedWindow";
import ConnectWalletScreen from "./components/atoms/connect-wallet-screen";
import { RootProvider } from "./RootProvider";
import { Layout } from "./Layout";
import { AppRoutes } from "./AppRoutes";


const NotDesktop = () => <><h1>Please make sure you're on a desktop or laptop computer.</h1><h5>Mobile and other browsers aren't supported in the beta version</h5></>

export const Proofs = React.lazy(() => import("./components/prove/proofs"));

const ConnectWalletFallback = () => {
  return (
    <Layout>
      <RoundedWindow>
        <ConnectWalletScreen />
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
  const [read, setReady] = useState(false);
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
        const walletNameTemp = 'onejudochop@gmail.com';
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
        const signature = await signer.signMessage('hello world')
        console.log('signature', signature)
      // } catch (err) {
      //   console.log('errr', err)
      // }
    })();
    
    Promise.all([
      WebFont.load({
        google: {
          families: [
            "Montserrat:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic",
          ],
        },
      }),
      // allOtherPromises().then(() => {
      //   setReady(true);
      // }).catch((e) => {
      //   setReady(true);
      // }),
    ])
  }, []);

  if (isMobile) return <NotDesktop />
  return (
    <Router>
      {/* TODO: Displaying this banana wallet stuff is just for testing. Delete it. */}
      <div style={{ margin: '20px', color: '#fff' }}>
        <h1>Banana wallet stuff</h1>
        <p>walletName: {walletName}</p>
        <p>isWalletNameUnique: {isWalletNameUnique ? 'true' : 'false'}</p>
        <p>JSON.stringify(walletAddress): {JSON.stringify(walletAddress ?? {})}</p>
        {/* <p>JSON.stringify(AAProvider): {JSON.stringify(AAProvider)}</p> */}
      </div>
      <RootProvider connectWalletFallback={<ConnectWalletFallback />} signMessagesFallback={<SignMessagesFallback />}>
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
