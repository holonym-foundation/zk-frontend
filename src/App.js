import "./App.css";
import "./normalize.css";
import "./webflow.css";
import "./holo-wtf.webflow.css";
import React, { Suspense, useEffect, useState } from "react";
import WebFont from "webfontloader";
import LoadingElement from "./components/loading-element";
import { browserName, isMobile } from "react-device-detect";
import SignatureContainer from "./components/SignatureContainer";
import { RootProvider } from "./RootProvider";
import { Layout } from "./Layout";
import { Router } from "./Router";



const NotDesktop = () => <><h1>Please make sure you're on a desktop or laptop computer.</h1><h5>Mobile and other browsers aren't supported in the beta version</h5></>

export const Proofs = React.lazy(() => import("./components/proofs"));

function App() {
  const [read, setReady] = useState(false);
  useEffect(() => {
    Promise.all([
      WebFont.load({
        google: {
          families: [
            "Montserrat:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic",
          ],
        },
      }),
      allOtherPromises().then(() => {
        setReady(true);
      }).catch((e) => {
        setReady(true);
      }),
    ])
  }, []);

  if (isMobile) return <NotDesktop />
  return (
    <RootProvider fallback={<div>Gate is closed</div>}>
      <Suspense fallback={<LoadingElement />}>
        <Layout>
          <Router />
        </Layout>
      </Suspense>
    </RootProvider>
  );
}

export default App;
