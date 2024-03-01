import React, { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./components/Landing";
// import Profile from './components/profile/profile';
// import IssuanceOptions from "./components/issuance/IssuanceOptions";
// import ProofMenu from "./components/prove/proof-menu";
// import OffChainProofs from './components/prove/OffChainProofs';
// import ConfirmReverify from "./components/issuance/GovernmentIDIssuance/ConfirmReverify";
// import GovIDRedirect from "./components/issuance/GovernmentIDIssuance/GovIDRedirect";
// import GovIDIssuanceVeriff from "./components/issuance/GovernmentIDIssuance/veriff/GovIDIssuanceVeriff";
// import GovIDIssuanceIdenfy from "./components/issuance/GovernmentIDIssuance/idenfy/GovIDIssuanceIdenfy";
// import GovIDIssuanceOnfido from "./components/issuance/GovernmentIDIssuance/onfido/GovIDIssuanceOnfido";
// import PhoneNumberIssuance from './components/issuance/PhoneNumberIssuance/PhoneNumberIssuance';
// import PhoneNumberRedirect from "./components/issuance/PhoneNumberIssuance/PhoneNumberRedirect";
// import PhonePaymentPrereqs from "./components/issuance/PhoneNumberIssuance/PhonePaymentPrereqs";
// import PhoneConfirmReverify from "./components/issuance/PhoneNumberIssuance/PhoneConfirmReverify";
// import MedicalCredentialsIssuance from './components/issuance/MedicalCredentialsIssuance';
// import ExternalIssuance from "./components/issuance/ExternalIssuance";
// import Register from './components/register';
// import OnChainProofs from "./components/prove/OnChainProofs";
// import GovIDPaymentPrereqs from "./components/issuance/GovernmentIDIssuance/GovIDPaymentPrereqs";
// import UnsupportedCountryPage from "./components/UnsupportedCountryPage";
// import PrivacyInfo from "./components/PrivacyInfo";

const Profile = lazy(() => import('./components/profile/profile'));
const IssuanceOptions = lazy(() => import("./components/issuance/IssuanceOptions"));
const ProofMenu = lazy(() => import("./components/prove/proof-menu"));
const OffChainProofs = lazy(() => import("./components/prove/OffChainProofs"));
const ConfirmReverify = lazy(() => import("./components/issuance/GovernmentIDIssuance/ConfirmReverify"));
const GovIDRedirect = lazy(() => import("./components/issuance/GovernmentIDIssuance/GovIDRedirect"));
const GovIDIssuanceVeriff = lazy(() => import("./components/issuance/GovernmentIDIssuance/veriff/GovIDIssuanceVeriff"));
const GovIDIssuanceIdenfy = lazy(() => import("./components/issuance/GovernmentIDIssuance/idenfy/GovIDIssuanceIdenfy"));
const GovIDIssuanceOnfido = lazy(() => import("./components/issuance/GovernmentIDIssuance/onfido/GovIDIssuanceOnfido"));
const PhoneNumberIssuance = lazy(() => import("./components/issuance/PhoneNumberIssuance/PhoneNumberIssuance"));
const PhoneNumberRedirect = lazy(() => import("./components/issuance/PhoneNumberIssuance/PhoneNumberRedirect"));
const PhonePaymentPrereqs = lazy(() => import("./components/issuance/PhoneNumberIssuance/PhonePaymentPrereqs"));
const PhoneConfirmReverify = lazy(() => import("./components/issuance/PhoneNumberIssuance/PhoneConfirmReverify"));
const MedicalCredentialsIssuance = lazy(() => import("./components/issuance/MedicalCredentialsIssuance"));
const ExternalIssuance = lazy(() => import("./components/issuance/ExternalIssuance"));
const Register = lazy(() => import("./components/register"));
const OnChainProofs = lazy(() => import("./components/prove/OnChainProofs"));
const GovIDPaymentPrereqs = lazy(() => import("./components/issuance/GovernmentIDIssuance/GovIDPaymentPrereqs"));
const UnsupportedCountryPage = lazy(() => import("./components/UnsupportedCountryPage"));
const PrivacyInfo = lazy(() => import("./components/PrivacyInfo"));

export function AppRoutes() {
  return (
    <Routes>
      {/* <Route path={"/"} element={<IssuanceOptions />} /> */}
      <Route path={"/"} element={<Landing />} />
      <Route path={"/issuance"} element={<IssuanceOptions />} />

      <Route path={"/issuance/idgov-prereqs"} element={<GovIDPaymentPrereqs />} />
      <Route path={"/issuance/idgov"} element={<GovIDRedirect />} />
      <Route path={"/issuance/idgov-confirm-reverify"} element={<ConfirmReverify />} />
      <Route path={"/issuance/idgov-veriff"} element={<GovIDIssuanceVeriff />} />
      <Route path={"/issuance/idgov-veriff/:store"} element={<GovIDIssuanceVeriff />} />
      <Route path={"/issuance/idgov-idenfy"} element={<GovIDIssuanceIdenfy />} />
      <Route path={"/issuance/idgov-idenfy/:store"} element={<GovIDIssuanceIdenfy />} />
      <Route path={"/issuance/idgov-onfido"} element={<GovIDIssuanceOnfido />} />
      <Route path={"/issuance/idgov-onfido/:store"} element={<GovIDIssuanceOnfido />} />
      
      <Route path={"/unsupported-country"} element={<UnsupportedCountryPage />} />

      <Route path={"/issuance/phone-prereqs"} element={<PhonePaymentPrereqs />} />
      <Route path={"/issuance/phone"} element={<PhoneNumberRedirect />} />
      <Route path={"/issuance/phone-confirm-reverify"} element={<PhoneConfirmReverify />} />
      <Route path={"/issuance/phone-verify"} element={<PhoneNumberIssuance />} />
      <Route path={"/issuance/phone-verify/:store"} element={<PhoneNumberIssuance />} />
      
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

      <Route path={"privacy"} element={<PrivacyInfo />} />
      {/* <Route path={"/chainswitchertest"} element={<ChainSwitcher />} /> */}
      {/* <Route path={"/chainswitchermodaltest"} element={<ChainSwitcherModal />} /> */}
      <Route path={"/register"} element={<Register />} />
    </Routes>
  );
}
