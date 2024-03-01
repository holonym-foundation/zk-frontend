import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingElement from "./components/loading-element";
import Landing from "./components/Landing";
import Profile from './components/profile/profile';
import OffChainProofs from './components/prove/OffChainProofs';
import GovIDIssuanceVeriff from "./components/issuance/GovernmentIDIssuance/veriff/GovIDIssuanceVeriff";
import GovIDIssuanceIdenfy from "./components/issuance/GovernmentIDIssuance/idenfy/GovIDIssuanceIdenfy";
import GovIDIssuanceOnfido from "./components/issuance/GovernmentIDIssuance/onfido/GovIDIssuanceOnfido";
import PhoneNumberIssuance from './components/issuance/PhoneNumberIssuance/PhoneNumberIssuance';
// import MedicalCredentialsIssuance from './components/issuance/MedicalCredentialsIssuance';
import ExternalIssuance from "./components/issuance/ExternalIssuance";
import Register from './components/register';
import OnChainProofs from "./components/prove/OnChainProofs";

const IssuanceOptions = lazy(() => import("./components/issuance/IssuanceOptions")); // good
const ProofMenu = lazy(() => import("./components/prove/proof-menu")); // good
const ConfirmReverify = lazy(() => import("./components/issuance/GovernmentIDIssuance/ConfirmReverify")); // good
const GovIDRedirect = lazy(() => import("./components/issuance/GovernmentIDIssuance/GovIDRedirect")); // good
const GovIDPaymentPrereqs = lazy(() => import("./components/issuance/GovernmentIDIssuance/GovIDPaymentPrereqs")); // good
const PhonePaymentPrereqs = lazy(() => import("./components/issuance/PhoneNumberIssuance/PhonePaymentPrereqs")); // good
const PhoneNumberRedirect = lazy(() => import("./components/issuance/PhoneNumberIssuance/PhoneNumberRedirect")); // good
const PhoneConfirmReverify = lazy(() => import("./components/issuance/PhoneNumberIssuance/PhoneConfirmReverify")); // good
const UnsupportedCountryPage = lazy(() => import("./components/UnsupportedCountryPage")); // good
const PrivacyInfo = lazy(() => import("./components/PrivacyInfo")); // good

// const Profile = lazy(() => import('./components/profile/profile')); // tested. not good
// const OffChainProofs = lazy(() => import("./components/prove/OffChainProofs")); // tested. not good
// const GovIDIssuanceVeriff = lazy(() => import("./components/issuance/GovernmentIDIssuance/veriff/GovIDIssuanceVeriff")); // tested. not good
// const PhoneNumberIssuance = lazy(() => import("./components/issuance/PhoneNumberIssuance/PhoneNumberIssuance")); // tested. not good
// const OnChainProofs = lazy(() => import("./components/prove/OnChainProofs")); // tested. not good
// const ExternalIssuance = lazy(() => import("./components/issuance/ExternalIssuance")); // tested. not good
// const GovIDIssuanceOnfido = lazy(() => import("./components/issuance/GovernmentIDIssuance/onfido/GovIDIssuanceOnfido")); // tested. not good
// const GovIDIssuanceIdenfy = lazy(() => import("./components/issuance/GovernmentIDIssuance/idenfy/GovIDIssuanceIdenfy")); // tested. not good
// const Register = lazy(() => import("./components/register")); // tested. not good

function ComponentWithSuspense(Component: React.LazyExoticComponent<() => JSX.Element>) {
  return (
    <Suspense fallback={<LoadingElement />}>
      <Component />
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={"/"} element={<Landing />} />
      <Route path={"/issuance"} element={ComponentWithSuspense(IssuanceOptions)} />

      <Route path={"/issuance/idgov-prereqs"} element={ComponentWithSuspense(GovIDPaymentPrereqs)} />
      <Route path={"/issuance/idgov"} element={ComponentWithSuspense(GovIDRedirect)} />
      <Route path={"/issuance/idgov-confirm-reverify"} element={ComponentWithSuspense(ConfirmReverify)} />
      <Route path={"/issuance/idgov-veriff"} element={<GovIDIssuanceVeriff />} />
      <Route path={"/issuance/idgov-veriff/:store"} element={<GovIDIssuanceVeriff />} />
      <Route path={"/issuance/idgov-idenfy"} element={<GovIDIssuanceIdenfy />} />
      <Route path={"/issuance/idgov-idenfy/:store"} element={<GovIDIssuanceIdenfy />} />
      <Route path={"/issuance/idgov-onfido"} element={<GovIDIssuanceOnfido />} />
      <Route path={"/issuance/idgov-onfido/:store"} element={<GovIDIssuanceOnfido />} />
      
      <Route path={"/unsupported-country"} element={ComponentWithSuspense(UnsupportedCountryPage)} />

      <Route path={"/issuance/phone-prereqs"} element={ComponentWithSuspense(PhonePaymentPrereqs)} />
      <Route path={"/issuance/phone"} element={ComponentWithSuspense(PhoneNumberRedirect)} />
      <Route path={"/issuance/phone-confirm-reverify"} element={ComponentWithSuspense(PhoneConfirmReverify)} />
      <Route path={"/issuance/phone-verify"} element={<PhoneNumberIssuance />} />
      <Route path={"/issuance/phone-verify/:store"} element={<PhoneNumberIssuance />} />
      
      {/* <Route path={"/issuance/med"} element={ComponentWithSuspense(MedicalCredentialsIssuance)} />
      <Route path={"/issuance/med/:store"} element={ComponentWithSuspense(MedicalCredentialsIssuance)} /> */}
      
      <Route path={"/issuance/external/:store"} element={<ExternalIssuance />} />
      <Route path={"/prove"} element={ComponentWithSuspense(ProofMenu)} />
      {/* For when there are actionIds and callbacks (right now, this feature is used by the uniqueness proof) */}
      <Route path={"/prove/:proofType/:actionId/:callback"} element={<OnChainProofs />} />
      <Route path={"/prove/:proofType/:actionId"} element={<OnChainProofs />} />
      <Route path={"/prove/:proofType"} element={<OnChainProofs />} />
      <Route path={"/prove/off-chain/:proofType/:actionId/:callback"} element={<OffChainProofs />} />
      <Route path={"/prove/off-chain/:proofType/:actionId"} element={<OffChainProofs />} />
      <Route path={"/prove/off-chain/:proofType"} element={<OffChainProofs />} />
      <Route path={"/profile"} element={<Profile />} />

      <Route path={"privacy"} element={ComponentWithSuspense(PrivacyInfo)} />
      {/* <Route path={"/chainswitchertest"} element={ComponentWithSuspense(ChainSwitcher)} /> */}
      {/* <Route path={"/chainswitchermodaltest"} element={ComponentWithSuspense(ChainSwitcherModal)} /> */}
      <Route path={"/register"} element={<Register />} />
    </Routes>
  );
}
