import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import { useAccount } from 'wagmi';
import { InfoButton } from "../info-button";
import PrivateInfoCard from "./PrivateInfoCard";
import PublicInfoCard from "./PublicInfoCard";
import { useLitAuthSig } from "../../context/LitAuthSig";
import { 
  getLocalEncryptedUserCredentials,
  getLocalProofMetadata,
  decryptObjectWithLit,
} from '../../utils/secrets';
import { 
  idServerUrl,
  primeToCountryCode,
  chainUsedForLit,
} from "../../constants/misc";
import { useHoloAuthSig } from "../../context/HoloAuthSig";

const credsFieldsToIgnore = [
  'completedAt',
  'issuer',
  'newSecret',
  'secret',
  'signature'
]

/**
 * Convert sortedCreds into object with shape { [credName]: { issuer: string, cred: string, completedAt: string } }
 */
function formatCreds(sortedCreds) {
  // Note: This flattening approach assumes two issuers will never provide the same field.
  // For example, only one issuer will ever provide a 'firstName' field.
  const reshapedCreds = {}
  Object.entries(sortedCreds).reduce((acc, [issuer, cred]) => {
    const rawCreds = sortedCreds[issuer].rawCreds ?? sortedCreds[issuer]; // This check is for backwards compatibility with the schema used before 2022-12-12    
    const newCreds = Object.entries(rawCreds).filter(([credName, credValue]) => credName !== 'completedAt').map(([credName, credValue]) => {
      return {
        [credName]: {
          issuer,
          cred: credValue,
          completedAt: rawCreds.completedAt,
        }
      }
    })
    return [...acc, ...newCreds];
  }, []).forEach(cred => {
    const [credName, credValue] = Object.entries(cred)[0];
    reshapedCreds[credName] = credValue;
  })
  const filteredCreds = Object.fromEntries(
    Object.entries(reshapedCreds).filter(([fieldName, value]) => {
      return !credsFieldsToIgnore.includes(fieldName);
    })
  );
  const formattedCreds = Object.fromEntries(
    Object.entries(filteredCreds).map(([fieldName, value]) => {
      if (fieldName === "countryCode") {
        return ['Country', { ...value, cred: primeToCountryCode[value.cred] }]
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
  // TODO: Once we submit proofs to multiple chains, we should sort by chain too
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
  const { data: account } = useAccount();
  const { getLitAuthSig, signLitAuthMessage } = useLitAuthSig();
  const {
    signHoloAuthMessage,
    holoAuthSigIsError,
    holoAuthSigIsLoading,
    holoAuthSigIsSuccess,
    getHoloAuthSigDigest
  } = useHoloAuthSig();

  useEffect(() => {
    if (!account?.address) return;
    (async () => {
      if (!getLitAuthSig()) {
        await signLitAuthMessage();
      }
      if (!getHoloAuthSigDigest()) {
        await signHoloAuthMessage();
      }
      setReadyToLoadCredsAndProofs(true);
    })()
  }, [account])

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
            getLitAuthSig()
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
            getLitAuthSig()
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
        <PublicInfoCard proofMetadata={proofMetadata} />
        <div className="spacer-large"></div>
        <PrivateInfoCard creds={creds} />
      </div>
    </div>
  </>
  );
}
