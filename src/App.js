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
import Navbar from "./components/atoms/Navbar";
// import Footer from "./components/atoms/Footer";
import Profile from './components/profile/profile';
import LoadingElement from "./components/loading-element";
// import {
//   ChainSwitcher,
//   ChainSwitcherModal,
//   useDesiredChain,
// } from "./components/chain-switcher";
// import Error from "./components/errors.js";
import { browserName, isMobile } from "react-device-detect";
import MintOptions from "./components/mint/mint-options.js";
import { LitAuthSigProvider } from './context/LitAuthSig';
import { HoloAuthSigProvider } from './context/HoloAuthSig';
import ToastyBugReportCard from "./components/atoms/ToastyBugReportCard";
import MintGovernmentID from "./components/mint/MintGovernmentID";
import MintPhoneNumber from './components/mint/MintPhoneNumber';

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
                    <Route exact path={"/mint/idgov"} element={<MintGovernmentID />} />
                    <Route exact path={"/mint/idgov/:store"} element={<MintGovernmentID />} />
                    <Route exact path={"/mint/phone"} element={<MintPhoneNumber />} />
                    <Route exact path={"/mint/phone/:store"} element={<MintPhoneNumber />} />

                    {/* TODO: Write a component for minting creds from external issuers. Should have 2 steps: "Store" and "Mint" */}
                    {/* <Route exact path={"/mint/external/:store"} element={<MintPhoneNumber />} /> */}

                    <Route exact path={"/prove"} element={<ProofMenu />} />
                    {/* For when there are actionIds and callbacks (right now, this feature is used by the uniqueness proof) */}
                    <Route exact path={"/prove/:proofType/:actionId/:callback"} element={<Proofs />} />
                    <Route exact path={"/prove/:proofType/:actionId"} element={<Proofs />} />
                    <Route exact path={"/prove/:proofType"} element={<Proofs />} />
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
  );
}

export default App;
