import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import { InfoButton } from "../info-button";
import { useAccount, useContractRead } from 'wagmi'
import ColoredHorizontalRule from "../atoms/ColoredHorizontalRule";
import { useProofMetadata } from "../../context/ProofMetadata";
import { ProofMetadataItem } from "../../types";
import { defaultActionId } from "../../constants";
import contractAddresses from '../../constants/contract-addresses.json'
import { jsonABIs } from '../../constants/abis'

type ZeroXString = `0x${string}`;

const mainnetOrTestnet = process.env.NODE_ENV === 'development' ? 'testnet' : 'mainnet'
const opOrOpGoerli = process.env.NODE_ENV === 'development' ? 'optimism-goerli' : 'optimism'

const sybilGovIdAddresses = contractAddresses.SybilResistanceV2[mainnetOrTestnet]
const sybilGovIdAddress = sybilGovIdAddresses[opOrOpGoerli as keyof typeof sybilGovIdAddresses] as ZeroXString

const isUSResidentAddresses = contractAddresses.SybilResistanceV2[mainnetOrTestnet]
const isUSResidentAddress = isUSResidentAddresses[opOrOpGoerli as keyof typeof isUSResidentAddresses] as ZeroXString

const sybilPhoneAddresses = contractAddresses.SybilResistanceV2[mainnetOrTestnet]
const sybilPhoneAddress = sybilPhoneAddresses[opOrOpGoerli as keyof typeof sybilPhoneAddresses] as ZeroXString

type ProofMetadataItemForDisplay = ProofMetadataItem & {
  displayName: string;
  fieldValue: string;
};

type FormattedProofMetadata = {
  [proofType: string]: ProofMetadataItemForDisplay;
};

const ProveButton = ({
  onClick,
  text,
}: {
  onClick: () => void;
  text: string;
}) => (
  <button onClick={onClick} className="profile-prove-button">
    {text}
  </button>
);

const ProofRow = ({
  proofTitle,
  infoText,
  address,
  onClickProve,
  buttonText,
}: {
  proofTitle: string;
  infoText: string;
  address?: string;
  onClickProve: () => void;
  buttonText: string;
}) => (
  <>
    <div className="public-info-proof-name">
      {proofTitle}
      <div style={{ position: "relative", left: "230px", bottom: "23px" }}>
        <InfoButton type="inPlace" text={infoText} />
      </div>
    </div>
    {address ? (
      <div className="public-info-sbt-owner">{address}</div>
    ) : (
      <ProveButton onClick={onClickProve} text={buttonText} />
    )}
  </>
);

function populateProofMetadataDisplayDataAndRestructure(
  proofMetadata: Array<ProofMetadataItem>
) {
  // TODO: Once we submit proofs to multiple chains, we should sort by chain too
  const proofMetadataObj: FormattedProofMetadata = {};
  for (const metadataItem of proofMetadata) {
    if (metadataItem.proofType === "uniqueness") {
      (metadataItem as ProofMetadataItemForDisplay).displayName =
        "Unique Person";
      // metadataItem.fieldValue = `for action ${metadataItem.actionId}`
      (metadataItem as ProofMetadataItemForDisplay).fieldValue = "Yes";
    } else if (metadataItem.proofType === "us-residency") {
      (metadataItem as ProofMetadataItemForDisplay).displayName = "US Resident";
      (metadataItem as ProofMetadataItemForDisplay).fieldValue = "Yes";
    }
    proofMetadataObj[metadataItem.proofType] =
      metadataItem as ProofMetadataItemForDisplay;
  }
  return proofMetadataObj;
}

export default function PublicInfoCard() {
  const navigate = useNavigate();
  const { proofMetadata, loadingProofMetadata } = useProofMetadata();
  const [formattedProofMetadata, setFormattedProofMetadata] =
    useState<FormattedProofMetadata>();

  const { address } = useAccount()

  const { 
    data: sybilGovIdIsUnique,
    isError: sybilGovIdIsUniqueIsError, 
    isLoading: sybilGovIdIsUniqueIsLoading,
  } = useContractRead({
    address: sybilGovIdAddress,
    abi: jsonABIs.SybilResistanceV2,
    functionName: 'isUniqueForAction',
    args: [
      address,
      defaultActionId,
    ]
  })

  const { 
    data: isUSResident,
    isError: isUSResidentIsError,
    isLoading: isUSResidentIsLoading,
  } = useContractRead({
    address: isUSResidentAddress,
    abi: jsonABIs.IsUSResidentV2,
    functionName: 'usResidency',
    args: [address]
  })

  const { 
    data: sybilPhoneIsUnique,
    isError: sybilPhoneIsUniqueIsError, 
    isLoading: sybilPhoneIsUniqueIsLoading,
  } = useContractRead({
    address: sybilPhoneAddress,
    abi: jsonABIs.SybilResistancePhone,
    functionName: 'isUniqueForAction',
    args: [
      address,
      defaultActionId,
    ]
  })

  const sybilGovIdSBTRecipient = useMemo(() => {
    if (formattedProofMetadata?.["uniqueness"]?.address) {
      return formattedProofMetadata?.["uniqueness"]?.address
    } else if (sybilGovIdIsUnique) {
      return address
    }
  }, [formattedProofMetadata, sybilGovIdIsUnique, address])

  const isUSResidentSBTRecipient = useMemo(() => {
    if (formattedProofMetadata?.["us-residency"]?.address) {
      return formattedProofMetadata?.["us-residency"]?.address
    } else if (isUSResident) {
      return address
    }
  }, [formattedProofMetadata, isUSResident, address])

  const sybilPhoneSBTRecipient = useMemo(() => {
    if (formattedProofMetadata?.["uniqueness-phone"]?.address) {
      return formattedProofMetadata?.["uniqueness-phone"]?.address
    } else if (sybilPhoneIsUnique) {
      return address
    }
  }, [formattedProofMetadata, sybilPhoneIsUnique, address])
  
  useEffect(() => {
    const formattedData =
      populateProofMetadataDisplayDataAndRestructure(proofMetadata);
    setFormattedProofMetadata(formattedData);
  }, [proofMetadata]);

  return (
    <>
      <div className="profile-info-card public-info">
        {loadingProofMetadata && !formattedProofMetadata ? (
          <Oval
            // height={100}
            // width={100}
            color="white"
            wrapperStyle={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#060612" // matches card background
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        ) : (
          <>
            <div className="card-header">
              <h2 className="card-header-title">Soulbound Tokens</h2>
              <p>
                When you generate a proof, you can get a soulbound token that
                records the proven fact.
              </p>
            </div>
            <ColoredHorizontalRule />
            <div className="card-content">
              <div className="public-info-grid">
                <div
                  style={{ fontWeight: "bold" }}
                  className="public-info-proof-name"
                >
                  Proof Type
                </div>
                <div
                  style={{ fontWeight: "bold" }}
                  className="public-info-sbt-owner"
                >
                  SBT belongs to
                </div>
                <ProofRow
                  proofTitle="Unique Person (government ID)"
                  infoText={`This shows whether you have publicly claimed a "Unique person (government ID)" SBT at a certain address. You can only prove this at one address from one government ID, allowing for robust Sybil resistance`}
                  address={sybilGovIdSBTRecipient}
                  onClickProve={() => navigate("/prove/uniqueness")}
                  buttonText="Prove uniqueness (government ID)"
                />
                <ProofRow
                  proofTitle="US Resident"
                  infoText={`This shows whether you've publicly claimed a US residency SBT at a certain address`}
                  address={isUSResidentSBTRecipient}
                  onClickProve={() => navigate("/prove/us-residency")}
                  buttonText="Prove US residency"
                />
                <ProofRow
                  proofTitle="Unique Person (phone number)"
                  infoText={`This shows whether you have publicly claimed a "Unique person (phone number)" SBT at a certain address. You can only prove this at one address from one phone number, allowing for robust Sybil resistance`}
                  address={sybilPhoneSBTRecipient}
                  onClickProve={() => navigate("/prove/uniqueness-phone")}
                  buttonText="Prove uniqueness (phone number)"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
