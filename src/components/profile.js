import { useState, useEffect, useRef } from "react";
import HolonymLogo from '../img/Holonym-Logo-W.png';
import UserImage from '../img/User.svg';
import HoloBurgerIcon from '../img/Holo-Burger-Icon.svg';
import Navbar from "./atoms/Navbar";
import ProfileField from "./atoms/ProfileField";
import { 
  getLocalEncryptedUserCredentials, 
  decryptUserCredentials 
} from '../utils/secrets';
import { serverAddress, primeToCountryCode } from "../constants/misc";

// birthdate: "1950-01-01"
// completedAt: "2022-09-16"
// countryCode: 2
// issuer: "0x8281316aC1D51c94f2DE77575301cEF615aDea84"
// newSecret: "0x8cf083f6d1e838874e577fc4f735de47"
// secret: "0x13dfda0ba0c0ff8545dc06daf74f1d15"
// signature: "0x661d1c65bb5d7bbe275ffa920754105ec4e8f9450c6939b5bafd8f25eca006ae1f80a06514e9c94955adc4d834a5a676d0a77a14295765db3ee17e9941ff42cb1c"
// subdivision: "NY"

const credsFieldsToIgnore = [
  'completedAt',
  'issuer',
  'newSecret',
  'secret',
  'signature'
]

export default function Profile(props) {
  const [creds, setCreds] = useState();

  // TODO: Get on-chain data. Figure out best way to store & retrieve info 
  // when user submits proofs. Do we just check the user's default wallet 
  // address? What if they submit proofs from different addresses?

  useEffect(() => {
    async function getAndSetCreds() {
      const encryptedCredsObj = getLocalEncryptedUserCredentials()
      if (!encryptedCredsObj) return; // TODO: Set error/message here telling user they have no creds. OR call API, and if API returns no creds, then display message
      const { sigDigest, encryptedCredentials, encryptedSymmetricKey } = encryptedCredsObj;
      const plaintextCreds = await decryptUserCredentials(encryptedCredentials, encryptedSymmetricKey) //, litAuthSig)
      // TODO: Make this compatible with multiple issuers
      const filteredCreds = Object.fromEntries(
        Object.entries(plaintextCreds[serverAddress]).filter(([fieldName, value]) => {
          return !credsFieldsToIgnore.includes(fieldName);
        })
      );
      const formattedFilteredCreds = Object.fromEntries(
        Object.entries(filteredCreds).map(([fieldName, value]) => {
          if (fieldName === "countryCode") {
            return ['Country', primeToCountryCode[value]]
          } else {
            let formattedFieldName = fieldName.replace(/([A-Z])/g, " $1");
            formattedFieldName =
              formattedFieldName.charAt(0).toUpperCase() + formattedFieldName.slice(1);
            return [formattedFieldName, value];
          }
        })
      );
      setCreds(formattedFilteredCreds);
    }
    getAndSetCreds()
  }, [])

  // TODO: Be sure to store & display addresses for proofs & public info that are linked 
  // to a user's blockchain address. For example, "0x123... is a unique person: Yes"

  return (
    <>
    <Navbar />
    <div className="x-section wf-section">
      <div className="x-container dashboard w-container">
        <div className="x-dash-div">
          <h1 className="h1">Public Info</h1>
          <div className="spacer-small"></div>
        </div>
        <div className="spacer-small"></div>
        <div className="x-wrapper dash">
          {/* <ProfileField header="Age" fieldValue="24" /> */}
          {/* <ProfileField header="Unique Person" fieldValue="Yes" /> */}
          <ProfileField header="Unique Person" fieldValue="" />
          <ProfileField header="US Resident" fieldValue="" />
        </div>
        <div className="spacer-large"></div>
        <div className="x-dash-div">
          <h1 className="h1">Private Info</h1>
          <div className="spacer-small"></div>
        </div>
        <div className="spacer-small"></div>
        <div className="x-wrapper dash">
          <ProfileField header="Country" fieldValue={creds?.['Country']} />
          <ProfileField header="Subdivision" fieldValue={creds?.['Subdivision']} />
          <ProfileField header="Birthdate" fieldValue={creds?.['Birthdate']} />
          <ProfileField header="Phone Number" fieldValue="" />
        </div>
      </div>
    </div>
  </>
  );
}
