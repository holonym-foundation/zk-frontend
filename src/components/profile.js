import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LitJsSdk from "@lit-protocol/sdk-browser";
import HolonymLogo from '../img/Holonym-Logo-W.png';
import UserImage from '../img/User.svg';
import HoloBurgerIcon from '../img/Holo-Burger-Icon.svg';
import PublicProfileField from './atoms/PublicProfileField';
import PrivateProfileField from './atoms/PrivateProfileField';
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
import { useHoloAuthSig } from "../context/HoloAuthSig";

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
  const navigate = useNavigate();
  const [creds, setCreds] = useState();
  const [proofMetadata, setProofMetadata] = useState();
  const { litAuthSig, setLitAuthSig } = useLitAuthSig();
  const {
    signHoloAuthMessage,
    holoAuthSig,
    holoAuthSigDigest,
    holoAuthSigIsError,
    holoAuthSigIsLoading,
    holoAuthSigIsSuccess,
  } = useHoloAuthSig();

  async function getAndSetProofMetadataFromServer() {
    const sigDigest = holoAuthSigDigest ? holoAuthSigDigest : await sha256(holoAuthSig)
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
      // TODO: if (!encryptedCredsObj) query server for creds
      if (!encryptedCredsObj) return;
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
        if (!holoAuthSig && !holoAuthSigDigest) {
          // Continue in next useEffect
          signHoloAuthMessage()
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

  return (
    <>
    <div className="x-section wf-section">
      <div className="x-container dashboard w-container">
        <div className="x-dash-div">
          <h1 className="h1">Public Info</h1>
          <div className="spacer-small"></div>
        </div>
        <div className="spacer-small"></div>
        <div className="x-wrapper dash">
          {/* <PublicProfileField header="Age" fieldValue="24" /> */}
          <PublicProfileField 
            header="Unique Person" 
            fieldValue={proofMetadata?.['uniqueness']?.fieldValue}
            proofSubmissionAddr={proofMetadata?.['uniqueness']?.address}
            proveButtonCallback={proofMetadata?.['uniqueness']?.address ? null :
              () => navigate('/prove/uniqueness')
            }
          />
          <PublicProfileField 
            header="US Resident" 
            fieldValue={proofMetadata?.['us-residency']?.fieldValue} 
            proveButtonCallback={proofMetadata?.['us-residency']?.address ? null :
              () => navigate('/prove/us-residency')
            }
          />
        </div>
        <div className="spacer-large"></div>
        <div className="x-dash-div">
          <h1 className="h1">Private Info</h1>
          <div className="spacer-small"></div>
        </div>
        <div className="spacer-small"></div>
        <div className="x-wrapper dash">
          {creds?.['Country'] && creds?.['Subdivision'] && creds?.['Birthdate'] ? (
            <>
              <PrivateProfileField 
                header="Country" 
                fieldValue={creds?.['Country']} 
              />
              <PrivateProfileField 
                header="Subdivision" 
                fieldValue={creds?.['Subdivision']}
              />
              <PrivateProfileField 
                header="Birthdate" 
                fieldValue={creds?.['Birthdate']}
              />
            </>
          ) : (
            <PrivateProfileField 
              header="Government ID" 
              fieldValue={undefined}
              verifyButtonCallback={() => navigate('/mint')}
            />
          )}
          <PrivateProfileField 
            header="Phone Number" 
            fieldValue=""
            // verifyButtonCallback={() => navigate('/mint')}
          />
          </div>
      </div>
    </div>
  </>
  );
}
