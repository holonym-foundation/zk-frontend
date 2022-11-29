import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LitJsSdk from "@lit-protocol/sdk-browser";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import PublicProfileField from './atoms/PublicProfileField';
import PrivateProfileField from './atoms/PrivateProfileField';
import { useLitAuthSig } from "../context/LitAuthSig";
import { 
  getLocalEncryptedUserCredentials,
  getLocalProofMetadata,
  decryptObjectWithLit,
} from '../utils/secrets';
import { 
  idServerUrl,
  primeToCountryCode,
  chainUsedForLit,
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
  const [readyToLoadCredsAndProofs, setReadyToLoadCredsAndProofs] = useState()
  const { litAuthSig, setLitAuthSig } = useLitAuthSig();
  const {
    signHoloAuthMessage,
    holoAuthSigIsError,
    holoAuthSigIsLoading,
    holoAuthSigIsSuccess,
    getHoloAuthSigDigest
  } = useHoloAuthSig();

  useEffect(() => {
    (async () => {
      if (!litAuthSig) {
        const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain: chainUsedForLit })
        setLitAuthSig(authSig);
      }
      if (!getHoloAuthSigDigest()) {
        await signHoloAuthMessage();
      }
      setReadyToLoadCredsAndProofs(true);
    })()
  }, [])

  useEffect(() => {
    async function getAndSetCreds() {
      try {
        let encryptedCredsObj = getLocalEncryptedUserCredentials()
        if (!encryptedCredsObj) {
          const resp = await fetch(`${idServerUrl}/credentials?sigDigest=${getHoloAuthSigDigest()}`)
          encryptedCredsObj = await resp.json();
        }
        if (encryptedCredsObj) {
          const plaintextCreds = await decryptObjectWithLit(
            encryptedCredsObj.encryptedCredentials, 
            encryptedCredsObj.encryptedSymmetricKey, 
            litAuthSig
          )
          const formattedCreds = formatCreds(plaintextCreds);
          setCreds(formattedCreds);
        }
      } catch (err) {
        console.log(err)
      }
    }
    async function getAndSetProofMetadata() {
      try {
        let encryptedProofMetadata = getLocalProofMetadata()
        if (!encryptedProofMetadata) {
          const resp = await fetch(`${idServerUrl}/proof-metadata?sigDigest=${getHoloAuthSigDigest()}`)
          encryptedProofMetadata = await resp.json();
        }
        if (encryptedProofMetadata) {
          const decryptedProofMetadata = await decryptObjectWithLit(
            encryptedProofMetadata.encryptedProofMetadata,
            encryptedProofMetadata.encryptedSymmetricKey,
            litAuthSig
          )
          const populatedData = populateProofMetadataDisplayDataAndRestructure(decryptedProofMetadata)
          setProofMetadata(populatedData)
        }
      } catch (err) {
        console.log(err)
      }
    }
    getAndSetCreds()
    getAndSetProofMetadata()
  }, [readyToLoadCredsAndProofs])

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
            proofSubmissionAddr={proofMetadata?.['us-residency']?.address}
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
                header="Name" 
                fieldValue={
                  ((creds?.['First Name'] ? creds['First Name'] + " " : "") +
                  (creds?.['Middle Name'] ? creds['Middle Name'] + " " : "") +
                  (creds?.['Last Name'] ? creds['Last Name'] : ""))
                  || undefined
                }
              />
              {/* <PrivateProfileField 
                header="First Name" 
                fieldValue={creds?.['First Name']}
              />
              <PrivateProfileField 
                header="Middle Name" 
                fieldValue={creds?.['Middle Name']}
              />
              <PrivateProfileField 
                header="Last Name" 
                fieldValue={creds?.['Last Name']}
              /> */}
              <PrivateProfileField 
                header="Birthdate" 
                fieldValue={creds?.['Birthdate']}
              />
              <PrivateProfileField 
                header="Street Address" 
                fieldValue={
                  ((creds?.['Street Number'] ? creds['Street Number'] + " " : "") +
                  (creds?.['Street Name'] ? creds['Street Name'] + " " : "") +
                  (creds?.['Street Unit'] ? creds['Street Unit'] : ""))
                  || undefined
                }
              />
              {/* <PrivateProfileField 
                header="Street Number" 
                fieldValue={creds?.['Street Number']}
              />
              <PrivateProfileField 
                header="Street Name" 
                fieldValue={creds?.['Street Name']}
              />
              <PrivateProfileField 
                header="Street Unit" 
                fieldValue={creds?.['Street Unit']}
              /> */}
              <PrivateProfileField 
                header="City" 
                fieldValue={creds?.['City']}
              />
              <PrivateProfileField 
                header="State" 
                fieldValue={creds?.['Subdivision']}
              />
              <PrivateProfileField 
                header="Zip Code" 
                fieldValue={creds?.['Zip Code']}
              />
              <PrivateProfileField 
                header="Country" 
                fieldValue={creds?.['Country']} 
              />
            </>
          ) : (
            <PrivateProfileField 
              header="Government ID" 
              fieldValue={undefined}
              verifyButtonCallback={() => navigate('/mint/idgov')}
            />
          )}
          <PrivateProfileField 
            header="Phone Number" 
            fieldValue={creds?.['Phone Number']}
            verifyButtonCallback={creds?.['Phone Number'] ?
              null : () => navigate('/mint/phone') 
            }
          />
          </div>
      </div>
    </div>
  </>
  );
}
