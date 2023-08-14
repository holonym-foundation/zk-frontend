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
      {/* <Route exact path={"/"} element={<IssuanceOptions />} /> */}
      <Route exact path={"/"} element={<Landing />} />
      <Route exact path={"/issuance"} element={<IssuanceOptions />} />

      <Route exact path={"/issuance/idgov"} element={<GovIDRedirect />} />
      <Route exact path={"/issuance/idgov-confirm-reverify"} element={<ConfirmReverify />} />
      <Route exact path={"/issuance/idgov-veriff"} element={<GovIDIssuanceVeriff />} />
      <Route exact path={"/issuance/idgov-veriff/:store"} element={<GovIDIssuanceVeriff />} />
      <Route exact path={"/issuance/idgov-idenfy"} element={<GovIDIssuanceIdenfy />} />
      <Route exact path={"/issuance/idgov-idenfy/:store"} element={<GovIDIssuanceIdenfy />} />
      <Route exact path={"/issuance/idgov-onfido"} element={<GovIDIssuanceOnfido />} />
      <Route exact path={"/issuance/idgov-onfido/:store"} element={<GovIDIssuanceOnfido />} />
      
      <Route exact path={"/issuance/phone"} element={<PhoneNumberIssuance />} />
      <Route exact path={"/issuance/phone/:store"} element={<PhoneNumberIssuance />} />
      <Route exact path={"/issuance/med"} element={<MedicalCredentialsIssuance />} />
      <Route exact path={"/issuance/med/:store"} element={<MedicalCredentialsIssuance />} />
      <Route exact path={"/issuance/external/:store"} element={<ExternalIssuance />} />
      <Route exact path={"/prove"} element={<ProofMenu />} />
      {/* For when there are actionIds and callbacks (right now, this feature is used by the uniqueness proof) */}
      <Route exact path={"/prove/:proofType/:actionId/:callback"} element={<OnChainProofs />} />
      <Route exact path={"/prove/:proofType/:actionId"} element={<OnChainProofs />} />
      <Route exact path={"/prove/:proofType"} element={<OnChainProofs />} />
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
