import React from "react";
import { Routes, Route } from "react-router-dom";
import Profile from './components/profile/profile';
import IssuanceOptions from "./components/issuance/IssuanceOptions";
import ProofMenu from "./components/prove/proof-menu";
import OffChainProofs from './components/prove/off-chain-proofs';
import GovernmentIDIssuance from "./components/issuance/GovernmentIDIssuance";
import PhoneNumberIssuance from './components/issuance/PhoneNumberIssuance';
import MedicalCredentialsIssuance from './components/issuance/MedicalCredentialsIssuance';
import ExternalIssuance from "./components/issuance/ExternalIssuance";
import { Proofs } from "./App";
import Register from './components/register';

export function AppRoutes() {
  return (
    <Routes>
      <Route exact path={"/"} element={<IssuanceOptions />} />
      <Route exact path={"/issuance"} element={<IssuanceOptions />} />
      <Route exact path={"/issuance/idgov"} element={<GovernmentIDIssuance />} />
      <Route exact path={"/issuance/idgov/:store"} element={<GovernmentIDIssuance />} />
      <Route exact path={"/issuance/phone"} element={<PhoneNumberIssuance />} />
      <Route exact path={"/issuance/phone/:store"} element={<PhoneNumberIssuance />} />
      <Route exact path={"/issuance/med"} element={<MedicalCredentialsIssuance />} />
      <Route exact path={"/issuance/med/:store"} element={<MedicalCredentialsIssuance />} />
      <Route exact path={"/issuance/external/:store"} element={<ExternalIssuance />} />
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
