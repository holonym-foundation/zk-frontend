import "./App.css";
import "./normalize.css";
import "./webflow.css";
import "./holo-wtf.webflow.css";
// import Proofs from "./components/proofs"
import ProofMenu from "./components/proof-menu";
import React, { Suspense, useEffect } from "react";
import WebFont from "webfontloader";
// import Welcome from "./components/welcome.js";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from "./components/atoms/Navbar";
// import Footer from "./components/atoms/Footer";
import Mint from "./components/mint.js";
import Profile from './components/profile/profile';
import LoadingElement from "./components/loading-element";
// import {
//   ChainSwitcher,
//   ChainSwitcherModal,
//   useDesiredChain,
// } from "./components/chain-switcher";
// import Error from "./components/errors.js";
import { browserName, isMobile } from "react-device-detect";
import MintOptions from "./components/mint-options.js";
import { LitAuthSigProvider } from './context/LitAuthSig';
import { HoloAuthSigProvider } from './context/HoloAuthSig';
import ToastyBugReportCard from "./components/atoms/ToastyBugReportCard";
import OffChainProofs from './components/off-chain-proofs';

const queryClient = new QueryClient()

const NotDesktop = () => <><h1>Please make sure you're on a desktop or laptop computer.</h1><h5>Mobile and other browsers aren't supported in the beta version</h5></>

const Proofs = React.lazy(() => import("./components/proofs"));

function App() {
  useEffect(() => {
    WebFont.load({
      google: {
        families: [
          "Montserrat:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic",
        ],
      },
    });
  }, []);

  if(isMobile) return <NotDesktop />
  return (
    <QueryClientProvider client={queryClient}>
      <LitAuthSigProvider>
        <HoloAuthSigProvider>
          <div className="x-section bg-img">
            <div className="x-container nav">
              <Navbar />
            </div>
            <Suspense fallback={<LoadingElement />}>
              <div className="App x-section wf-section">
                <div className="x-container nav w-container">
                  <Router>
                    <Routes>
                      <Route exact path={"/"} element={<MintOptions />} />
                      <Route exact path={"/mint"} element={<MintOptions />} />
                      <Route exact path={"/mint/:credType/:storing"} element={<Mint />} />
                      <Route exact path={"/mint/:credType"} element={<Mint />} />
                      <Route exact path={"/retry"} element={<Mint retry={true} />} />
                      <Route exact path={"/prove"} element={<ProofMenu />} />
                      {/* For when there are actionIds and callbacks (right now, this feature is used by the uniqueness proof) */}
                      <Route exact path={"/prove/:proofType/:actionId/:callback"} element={<Proofs />} />
                      <Route exact path={"/prove/:proofType/:actionId"} element={<Proofs />} />
                      <Route exact path={"/prove/:proofType"} element={<Proofs />} />
                      {/* TODO: Extract common elements from Proofs and OffChainProofs components, and put them in separate files/components */}
                      <Route exact path={"/prove/off-chain/:proofType/:actionId/:callback"} element={<OffChainProofs />} />
                      <Route exact path={"/prove/off-chain/:proofType/:actionId"} element={<OffChainProofs />} />
                      <Route exact path={"/prove/off-chain/:proofType"} element={<OffChainProofs />} />
                      <Route exact path={"/profile"} element={<Profile />} />
                      {/* <Route path={"/chainswitchertest"} element={<ChainSwitcher />} /> */}
                      {/* <Route path={"/chainswitchermodaltest"} element={<ChainSwitcherModal />} /> */}
                    </Routes>
                  </Router>
                </div>
              </div>
              <ToastyBugReportCard />
            </Suspense>
          {/* <Footer /> */}
          </div>
        </HoloAuthSigProvider>
      </LitAuthSigProvider>
    </QueryClientProvider>
  );
}

export default App;
