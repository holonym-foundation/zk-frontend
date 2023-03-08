import React from "react";
import { Routes, Route } from "react-router-dom";
import Profile from './components/profile/profile';
import VerificationOptions from "./components/verify/verification-options";
import ProofMenu from "./components/prove/proof-menu";
import OffChainProofs from './components/prove/off-chain-proofs';
import VerifyGovernmentID from "./components/verify/VerifyGovernmentID";
import VerifyPhoneNumber from './components/verify/VerifyPhoneNumber';
import VerifyMedicalCredentials from './components/verify/VerifyMedicalCredentials';
import VerifyExternal from "./components/verify/VerifyExternal";
import { Proofs } from "./App";
import Register from './components/register';

export function AppRoutes() {
  return (
    <Routes>
      <Route exact path={"/"} element={<VerificationOptions />} />
      <Route exact path={"/verify"} element={<VerificationOptions />} />
      <Route exact path={"/verify/idgov"} element={<VerifyGovernmentID />} />
      <Route exact path={"/verify/idgov/:store"} element={<VerifyGovernmentID />} />
      <Route exact path={"/verify/phone"} element={<VerifyPhoneNumber />} />
      <Route exact path={"/verify/phone/:store"} element={<VerifyPhoneNumber />} />
      <Route exact path={"/verify/med"} element={<VerifyMedicalCredentials />} />
      <Route exact path={"/verify/med/:store"} element={<VerifyMedicalCredentials />} />
      <Route exact path={"/verify/external/:store"} element={<VerifyExternal />} />
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
      <Route exact path={"/register"} element={<Register />} />
    </Routes>
  );
}
