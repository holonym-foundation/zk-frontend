import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from 'wagmi';
import PrivateInfoCard from "./PrivateInfoCard";
import PublicInfoCard from "./PublicInfoCard";
import { useLitAuthSig } from "../../context/LitAuthSig";
import { 
  getCredentials,
  getProofMetadata,
} from '../../utils/secrets';
import { 
  primeToCountryCode,
} from "../../constants/misc";
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";

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
    // Handle gov id creds
    const rawCreds = sortedCreds[issuer]?.metadata?.rawCreds ?? sortedCreds[issuer]?.metadata ?? {};
    const newCreds = Object.entries(rawCreds).filter(([credName, credValue]) => credName !== 'completedAt').map(([credName, credValue]) => {
      const secondsSince1900 = (parseInt(ethers.BigNumber.from(sortedCreds[issuer]?.creds?.iat ?? 2208988800).toString()) * 1000) - 2208988800000;
      return {
        [credName]: {
          issuer,
          cred: credValue,
          iat: secondsSince1900 ? new Date(secondsSince1900).toISOString().slice(0, 10) : undefined,
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
  const [creds, setCreds] = useState();
  const [credsLoading, setCredsLoading] = useState(true);
  const [proofMetadata, setProofMetadata] = useState();
  const [proofMetadataLoading, setProofMetadataLoading] = useState(true);
  const [readyToLoadCredsAndProofs, setReadyToLoadCredsAndProofs] = useState()
  const { data: account } = useAccount();
  const { litAuthSig } = useLitAuthSig();
  const { holoAuthSigDigest } = useHoloAuthSig();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();

  useEffect(() => {
    if (!account?.address) return;
    setReadyToLoadCredsAndProofs(true);
  }, [account])

  useEffect(() => {
    async function getAndSetCreds() {
      try {
        const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig);
        if (!sortedCreds) return;
        const formattedCreds = formatCreds(sortedCreds);
        setCreds(formattedCreds);
      } catch (err) {
        console.log(err)
      } finally {
        setCredsLoading(false)
      }
    }
    async function getAndSetProofMetadata() {
      try {
        const proofMetadataTemp = await getProofMetadata(holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig, true);
        if (proofMetadataTemp) {
          const populatedData = populateProofMetadataDisplayDataAndRestructure(proofMetadataTemp)
          setProofMetadata(populatedData)
        }
      } catch (err) {
        console.log(err)
      } finally {
        setProofMetadataLoading(false)
      }
    }
    getAndSetCreds()
    getAndSetProofMetadata()
  }, [readyToLoadCredsAndProofs])

  return (
    <>
    <div className="x-section wf-section">
      <div className="x-container dashboard w-container">
        <PublicInfoCard proofMetadata={proofMetadata} loading={proofMetadataLoading} />
        <div className="spacer-large"></div>
        <PrivateInfoCard creds={creds} loading={credsLoading} />
      </div>
    </div>
  </>
  );
}
