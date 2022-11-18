import { useState, useEffect, useRef } from "react";
import LitJsSdk from "@lit-protocol/sdk-browser";
import HolonymLogo from '../img/Holonym-Logo-W.png';
import UserImage from '../img/User.svg';
import HoloBurgerIcon from '../img/Holo-Burger-Icon.svg';
import Navbar from "./atoms/Navbar";
import ProfileField from "./atoms/ProfileField";
import { useLitAuthSig } from "../context/LitAuthSig";
import { 
  getLocalEncryptedUserCredentials,
  getLocalProofMetadata,
  decryptObjectWithLit
} from '../utils/secrets';
import { serverAddress, primeToCountryCode, chainUsedForLit } from "../constants/misc";

// birthdate
// completedAt
// countryCode
// issuer
// newSecret
// secret
// signature
// subdivision

const credsFieldsToIgnore = [
  'completedAt',
  'issuer',
  'newSecret',
  'secret',
  'signature'
]

function formatCreds(creds) {
  // Note: This flattening approach assumes two issuers will never provide the same field.
  // For example, we will never use BOTH Vouched and Persona to retrieve "countryCode"
  const flattenedCreds = {}
  for (const issuer of Object.keys(creds)) {
    Object.assign(flattenedCreds, { ...flattenedCreds, ...creds[issuer] })
  }
  const filteredCreds = Object.fromEntries(
    Object.entries(flattenedCreds).filter(([fieldName, value]) => {
      return !credsFieldsToIgnore.includes(fieldName);
    })
  );
  const formattedCreds = Object.fromEntries(
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
  return formattedCreds;
}

function populateProofMetadataDisplayData(proofMetadata) {
  for (const metadataItem of proofMetadata) {
    if (metadataItem.proofType === 'uniqueness') {
      metadataItem.displayName = 'Unique Person'
      // metadataItem.fieldValue = `for action ${metadataItem.actionId}`
      metadataItem.fieldValue = 'Yes'
    }
    else if (metadataItem.proofType === 'us-residency') {
      metadataItem.displayName = 'US Resident'
      metadataItem.fieldValue = 'Yes'
    }
  }
  return proofMetadata;
}

export default function Profile(props) {
  const [creds, setCreds] = useState();
  const [proofMetadata, setProofMetadata] = useState();
  const { litAuthSig, setLitAuthSig } = useLitAuthSig();

  useEffect(() => {
    async function getAndSetCreds() {
      const encryptedCredsObj = getLocalEncryptedUserCredentials()
      if (!encryptedCredsObj) return; // TODO: Set error/message here telling user they have no creds. OR call API, and if API returns no creds, then display message
      const { sigDigest, encryptedCredentials, encryptedSymmetricKey } = encryptedCredsObj;
      const plaintextCreds = await decryptObjectWithLit(encryptedCredentials, encryptedSymmetricKey, litAuthSig)
      const formattedCreds = formatCreds(plaintextCreds);
      setCreds(formattedCreds);
    }
    async function getAndSetProofMetadata() {
      const localProofMetadata = getLocalProofMetadata()
      if (localProofMetadata) {
        const decryptedLocalProofMetadata = await decryptObjectWithLit(
          localProofMetadata.encryptedProofMetadata,
          localProofMetadata.encryptedSymmetricKey,
          litAuthSig
        )
        setProofMetadata(
          populateProofMetadataDisplayData(decryptedLocalProofMetadata)
        )
      }
      // TODO: Query server for proof metadata
    }
    async function init() {
      const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain: chainUsedForLit })
      setLitAuthSig(authSig);
      await getAndSetCreds()
      getAndSetProofMetadata()
    }
    init()
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
          {/* <ProfileField header="Unique Person" fieldValue="" /> */}
          {/* <ProfileField header="US Resident" fieldValue="" /> */}
          {proofMetadata && proofMetadata.length > 0 ? (
            proofMetadata.map((metadataItem) => 
              <ProfileField
                key={metadataItem.txHash} 
                header={metadataItem.displayName} 
                fieldValue={metadataItem.fieldValue}
              />
            )
          ) : null}
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
          {/* <ProfileField header="Phone Number" fieldValue="" verifyCallback={() => {}} /> */}
          <ProfileField header="Phone Number" fieldValue="" />
          </div>
      </div>
    </div>
  </>
  );
}
