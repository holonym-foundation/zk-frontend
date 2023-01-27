import ProofMenu from "./components/proof-menu";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from './components/profile/profile';
import MintOptions from "./components/mint/mint-options.js";
import OffChainProofs from './components/off-chain-proofs';
import MintGovernmentID from "./components/mint/MintGovernmentID";
import MintPhoneNumber from './components/mint/MintPhoneNumber';
import MintExternal from "./components/mint/MintExternal";
import { Proofs } from "./App";

export function Router() {
  return (
    <Router>
      <Routes>
        <Route exact path={"/"} element={<MintOptions />} />
        <Route exact path={"/mint"} element={<MintOptions />} />
        <Route exact path={"/mint/idgov"} element={<MintGovernmentID />} />
        <Route exact path={"/mint/idgov/:store"} element={<MintGovernmentID />} />
        <Route exact path={"/mint/phone"} element={<MintPhoneNumber />} />
        <Route exact path={"/mint/phone/:store"} element={<MintPhoneNumber />} />
        <Route exact path={"/mint/external/:store"} element={<MintExternal />} />
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
  );
}
;
