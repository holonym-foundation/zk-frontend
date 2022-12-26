import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import LitJsSdk from "@lit-protocol/sdk-browser";
import { 
  getLocalEncryptedUserCredentials,
  decryptObjectWithLit,
  storeProofMetadata,
  sha256
} from "../utils/secrets";
import {
  getDateAsInt,
  poseidonTwoInputs,
  proofOfResidency,
  antiSybil,
} from "../utils/proofs";
import { 
  serverAddress, 
  idServerUrl, 
  holonymAuthMessage, 
  defaultActionId,
  chainUsedForLit,
  defaultChainToProveOn
} from "../constants/misc";
// import ConnectWallet from "./atoms/ConnectWallet";
// import residencyStoreABI from "../constants/abi/zk-contracts/ResidencyStore.json";
// import antiSybilStoreABI from "../constants/abi/zk-contracts/AntiSybilStore.json";

import { Success } from "./success";
import { Oval } from "react-loader-spinner";
import { truncateAddress } from "../utils/ui-helpers";
import RoundedWindow from "./RoundedWindow";
// import { getExtensionState } from "../utils/extension-helpers";
import { useLitAuthSig } from "../context/LitAuthSig";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import Relayer from "../utils/relayer";
import ConnectWalletScreen from "./atoms/connect-wallet-screen";

const ErrorScreen = ({children}) => (
  <div className="x-container w-container">
      {children}
  </div>
)


const LoadingProofsButton = (props) => (
  <button className="x-button" onClick={props.onClick}>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      Proof Loading
      <Oval
        height={10}
        width={10}
        color="#464646"
        wrapperStyle={{ marginLeft: "5px" }}
        wrapperClass=""
        visible={true}
        ariaLabel="oval-loading"
        secondaryColor="#01010c"
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
    </div>
  </button>
);


const Proofs = () => {
  const params = useParams();
  const [creds, setCreds] = useState();
  const [success, setSuccess] = useState();
  const [error, setError] = useState();
  const [customError, setCustomError] = useState();
  const [proof, setProof] = useState();
  const [submissionConsent, setSubmissionConsent] = useState(false);
  const [readyToLoadCreds, setReadyToLoadCreds] = useState();
  const [es, setES] = useState();
  const { litAuthSig, setLitAuthSig } = useLitAuthSig();
  const { data: account } = useAccount();
  const { switchNetworkAsync } = useNetwork()
  const {
    signHoloAuthMessage,
    holoAuthSigIsError,
    holoAuthSigIsLoading,
    holoAuthSigIsSuccess,
    getHoloAuthSigDigest,
  } = useHoloAuthSig();

  const proofs = {
    "us-residency": {
      name: "US Residency",
      contractName: "IsUSResident",
      loadProof: loadPoR,
    },
    uniqueness: {
      name: "Uniqueness",
      contractName: "SybilResistance",
      loadProof: loadAntiSybil,
    },
  };

  async function loadPoR() {
    const creds_ = creds[serverAddress["idgov"]]
    if (!creds_) {
      setCustomError(<p>To do this proof, your Holo must have a government ID. Please <a href="/mint/idgov" style={{ color: '#fdc094'}}>add a government ID</a></p>);
      return;
    }
    const salt = "18450029681611047275023442534946896643130395402313725026917000686233641593164"; // this number is poseidon("IsFromUS")
    const footprint = await poseidonTwoInputs([
      salt,
      ethers.BigNumber.from(creds_.newSecret).toString(),
    ]);

    const [issuer_, oldSecret_, countryCode_, nameCitySubdivisionZipStreetHash_, completedAt_, birthdate_] = creds_.serializedCreds;
    const por = await proofOfResidency(
      account.address,
      issuer_,
      salt,
      footprint,
      countryCode_,
      nameCitySubdivisionZipStreetHash_,
      completedAt_,
      birthdate_,
      creds_.newSecret
    );
    // Once setProof is called, the proof is submtited
    setProof(por);
    console.log("proof is", JSON.stringify(por));
  }

  async function loadAntiSybil() {
    const actionId = params.actionId || defaultActionId;
    if (!params.actionId)
      console.error(
        `Warning: no actionId was given, using default of ${defaultActionId} (generic cross-action sybil resistance)`
      );
    console.log("actionId", actionId);

    const creds_ = creds[serverAddress["idgov"]]
    if (!creds_) {
      setCustomError(<p>To do this proof, your Holo must have a government ID. Please <a href="/mint/idgov" style={{ color: '#fdc094'}}>add a government ID</a></p>);
      return;
    }    
  
    const footprint = await poseidonTwoInputs([
      actionId,
      ethers.BigNumber.from(creds_.newSecret).toString(),
    ]);

    const [issuer_, oldSecret_, countryCode_, nameCitySubdivisionZipStreetHash_, completedAt_, birthdate_] = creds_.serializedCreds;

    const as = await antiSybil(
      account.address,
      issuer_,
      actionId,
      footprint,
      countryCode_, 
      nameCitySubdivisionZipStreetHash_, 
      completedAt_, 
      birthdate_,
      creds_.newSecret
    );
    // Once setProof is called, the proof is submtited
    setProof(as);
  }

  // Steps:
  // 1. Ensure user's wallet is connected (i.e., get account)
  // 2. Get & set holoAuthSigDigest
  // 3. Get & set creds
  // 4. Get & set proof
  // 5. Submit proof tx

  useEffect(() => {
    if (account?.address && !getHoloAuthSigDigest()) {
      console.log('Requesting signature for holoAuthSigDigest')
      signHoloAuthMessage().then(() => setReadyToLoadCreds(true))
    }
    if (account?.address && getHoloAuthSigDigest()) setReadyToLoadCreds(true);
  }, [account]);

  useEffect(() => {
    if (!readyToLoadCreds) return;
    async function loadCreds() {
      console.log('Loading creds')
      let encryptedCredentials, encryptedSymmetricKey;
      const localEncryptedCreds = getLocalEncryptedUserCredentials()
      if (localEncryptedCreds) {
        encryptedCredentials = localEncryptedCreds.encryptedCredentials
        encryptedSymmetricKey = localEncryptedCreds.encryptedSymmetricKey
      } else {
        const resp = await fetch(`${idServerUrl}/credentials?sigDigest=${getHoloAuthSigDigest()}`)
        const data = await resp.json();
        if (!data) {
          setError("Error: Could not retrieve credentials for proof. Please make sure you have minted your Holo.");
        }
        encryptedCredentials = data.encryptedCredentials
        encryptedSymmetricKey = data.encryptedSymmetricKey
      }
      const sortedCreds = await decryptObjectWithLit(encryptedCredentials, encryptedSymmetricKey)
      if (sortedCreds) {
        setCreds(sortedCreds)
      } else {
        setError(
          "Could not retrieve credentials for proof. Please make sure you have minted your Holo."
        );
      }
    }
    loadCreds();
  }, [readyToLoadCreds]);

  useEffect(() => {
    if (!account?.address) return;
    if (!creds) return;
    if (!(params.proofType in proofs)) return;
    console.log('Loading proof')
    proofs[params.proofType].loadProof();
  }, [creds]);

  useEffect(() => {
    if (!(submissionConsent && creds && proof)) return;
    submitProofThenStoreMetadata(
      proof,
      proofs[params.proofType].contractName
    );
  }, [proof, submissionConsent]);

  if (account && !window.ethereum) {
    setError("Currently, this only works with MetaMask");
    return;
  }

  async function submitProofThenStoreMetadata(proof,contractName) {
      const result = await Relayer.prove(proof, contractName, defaultChainToProveOn);
      console.log("relayer result", result)
      if(!result.error) {
        // TODO: At this point, display message to user that they are now signing to store their proof metadata
        const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain: chainUsedForLit })
        setLitAuthSig(authSig);
        await storeProofMetadata(result.data, params.proofType, params.actionId, authSig, getHoloAuthSigDigest())
        setSuccess(true);
      }
      else {
        console.log("error", result)
        setError(result?.error?.response?.data?.error?.reason || result?.error?.message)
      }
  }

  if (success) {
    if (params.callback) window.location.href = "https://" + params.callback;
    return <Success title="Success" />;
  }
  // Still have to do this in case metamask isn't logged in. would be good to have equivalent for other types of connectors, but we're not really using wagmi rn
  try {
    window.ethereum.request({ method: "eth_requestAccounts" });
  } catch(e) {
    console.error("Unable to call eth_requestAccounts. Installing Metamask may fix this bug")
    return <ErrorScreen>
            <h3>Please install <a href="https://metamask.io/">Metamask</a></h3>
          </ErrorScreen>
  }

  if (customError) return <ErrorScreen>
        {customError}
  </ErrorScreen>
  return (
    // <Suspense fallback={<LoadingElement />}>
    <RoundedWindow>
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
        {!account?.address ? (
          <ConnectWalletScreen />
        ) : (
          <>
            <h2>Prove {proofs[params.proofType].name}</h2>
                <div className="spacer-med" />
                <br />
                {error ? (
                  <p>Error: {error}</p>
                ) : (creds ? <p>
                        This will give you, 
                        <code> {truncateAddress(account.address)} </code>, 
                        a <a target="_blank" href="https://cointelegraph.com/news/what-are-soulbound-tokens-sbts-and-how-do-they-work" style={{ color: '#fdc094'}}>soul-bound token</a> (SBT)
                        showing only this one attribute of you: <code>{proofs[params.proofType].name}</code>. It
                        may take 5-15 seconds to load.
                      </p>
                    :
                      <p>
                        &nbsp;Note: You cannot generate proofs before minting a holo. If you have not
                        already, please <a href="/mint" style={{ color: '#fdc094'}}>mint your holo</a>.
                      </p>
                    )
                  }
                    <div className="spacer-med" />
                    <br />
                    {creds ? (
                      proof ? (
                        <button
                          className="x-button"
                          onClick={() => setSubmissionConsent(true)}
                        >
                          Submit proof
                        </button>
                      ) : (
                        <LoadingProofsButton />
                      )
                    ) : (
                      ""
                    )}
                  </>
        )}
    </div>
    </RoundedWindow>
    // </Suspense>
  );
};

export default Proofs;
