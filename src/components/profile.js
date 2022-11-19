import { useState, useEffect, useRef } from "react";
import { useSignMessage } from 'wagmi';
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
  decryptObjectWithLit,
  sha256
} from '../utils/secrets';
import { 
  serverAddress,
  idServerUrl,
  primeToCountryCode,
  chainUsedForLit,
  holonymAuthMessage
} from "../constants/misc";

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

function populateProofMetadataDisplayDataAndRestructure(proofMetadata) {
  const proofMetadataObj = {}
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
    proofMetadataObj[metadataItem.proofType] = metadataItem;
  }
  return proofMetadataObj;
}

export default function Profile(props) {
  const [creds, setCreds] = useState();
  const [proofMetadata, setProofMetadata] = useState();
  const { litAuthSig, setLitAuthSig } = useLitAuthSig();
  const {
    data: holoAuthSig,
    isError: holoAuthSigIsError,
    isLoading,
    isSuccess: holoAuthSigIsSuccess, 
    signMessage
  } = useSignMessage({ message: holonymAuthMessage })

  async function getAndSetProofMetadataFromServer() {
    const sigDigest = await sha256(holoAuthSig)
    const resp = await fetch(`${idServerUrl}/proof-metadata?sigDigest=${sigDigest}`)
    const data = await resp.json();
    const decryptedLocalProofMetadata = data ? await decryptObjectWithLit(
      data.encryptedProofMetadata,
      data.encryptedSymmetricKey,
      litAuthSig
    ) : []
    setProofMetadata(
      populateProofMetadataDisplayDataAndRestructure(decryptedLocalProofMetadata)
    )
  }

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
          populateProofMetadataDisplayDataAndRestructure(decryptedLocalProofMetadata)
        )
      } else {
        if (!holoAuthSig) {
          // Continue in next useEffect
          signMessage()
        } else {
          await getAndSetProofMetadataFromServer()
        }
      }
    }
    async function init() {
      const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain: chainUsedForLit })
      setLitAuthSig(authSig);
      await getAndSetCreds()
      getAndSetProofMetadata()
    }
    init()
  }, [])

  useEffect(() => {
    if (!holoAuthSig && !holoAuthSigIsSuccess) return;
    if (holoAuthSigIsError) {
      throw new Error('Failed to sign Holonym authentication message needed to get proof metadata.')
    }
    getAndSetProofMetadataFromServer()
  }, [holoAuthSig])

  // TODO: Be sure to store & display addresses for proofs & public info that are linked 
  // to a user's blockchain address. For example, "0x123... is a unique person: Yes"

  console.log(proofMetadata)

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
          <ProfileField 
            header="Unique Person" 
            fieldValue={proofMetadata?.['uniqueness']?.fieldValue} 
          />
          <ProfileField 
            header="US Resident" 
            fieldValue={proofMetadata?.['us-residency']?.fieldValue} 
          />
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
