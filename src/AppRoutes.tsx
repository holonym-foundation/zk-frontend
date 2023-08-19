import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
import Profile from './components/profile/profile';
import IssuanceOptions from "./components/issuance/IssuanceOptions";
import ProofMenu from "./components/prove/proof-menu";
import OffChainProofs from './components/prove/OffChainProofs';
import ConfirmReverify from "./components/issuance/GovernmentIDIssuance/ConfirmReverify";
import GovIDRedirect from "./components/issuance/GovernmentIDIssuance/GovIDRedirect";
import GovIDIssuanceVeriff from "./components/issuance/GovernmentIDIssuance/veriff/GovIDIssuanceVeriff";
import GovIDIssuanceIdenfy from "./components/issuance/GovernmentIDIssuance/idenfy/GovIDIssuanceIdenfy";
import GovIDIssuanceOnfido from "./components/issuance/GovernmentIDIssuance/onfido/GovIDIssuanceOnfido";
import PhoneNumberIssuance from './components/issuance/PhoneNumberIssuance';
import MedicalCredentialsIssuance from './components/issuance/MedicalCredentialsIssuance';
import ExternalIssuance from "./components/issuance/ExternalIssuance";
import { OnChainProofs } from "./App";
import Register from './components/register';

export function AppRoutes() {
  return (
    <Routes>
      {/* <Route path={"/"} element={<IssuanceOptions />} /> */}
      <Route path={"/"} element={<Landing />} />
      <Route path={"/issuance"} element={<IssuanceOptions />} />

      <Route path={"/issuance/idgov"} element={<GovIDRedirect />} />
      <Route path={"/issuance/idgov-confirm-reverify"} element={<ConfirmReverify />} />
      <Route path={"/issuance/idgov-veriff"} element={<GovIDIssuanceVeriff />} />
      <Route path={"/issuance/idgov-veriff/:store"} element={<GovIDIssuanceVeriff />} />
      <Route path={"/issuance/idgov-idenfy"} element={<GovIDIssuanceIdenfy />} />
      <Route path={"/issuance/idgov-idenfy/:store"} element={<GovIDIssuanceIdenfy />} />
      <Route path={"/issuance/idgov-onfido"} element={<GovIDIssuanceOnfido />} />
      <Route path={"/issuance/idgov-onfido/:store"} element={<GovIDIssuanceOnfido />} />
      
      <Route path={"/issuance/phone"} element={<PhoneNumberIssuance />} />
      <Route path={"/issuance/phone/:store"} element={<PhoneNumberIssuance />} />
      <Route path={"/issuance/med"} element={<MedicalCredentialsIssuance />} />
      <Route path={"/issuance/med/:store"} element={<MedicalCredentialsIssuance />} />
      <Route path={"/issuance/external/:store"} element={<ExternalIssuance />} />
      <Route path={"/prove"} element={<ProofMenu />} />
      {/* For when there are actionIds and callbacks (right now, this feature is used by the uniqueness proof) */}
      <Route path={"/prove/:proofType/:actionId/:callback"} element={<OnChainProofs />} />
      <Route path={"/prove/:proofType/:actionId"} element={<OnChainProofs />} />
      <Route path={"/prove/:proofType"} element={<OnChainProofs />} />
      <Route path={"/prove/off-chain/:proofType/:actionId/:callback"} element={<OffChainProofs />} />
      <Route path={"/prove/off-chain/:proofType/:actionId"} element={<OffChainProofs />} />
      <Route path={"/prove/off-chain/:proofType"} element={<OffChainProofs />} />
      <Route path={"/profile"} element={<Profile />} />
      {/* <Route path={"/chainswitchertest"} element={<ChainSwitcher />} /> */}
      {/* <Route path={"/chainswitchermodaltest"} element={<ChainSwitcherModal />} /> */}
      <Route path={"/register"} element={<Register />} />
    </Routes>
  );
}
