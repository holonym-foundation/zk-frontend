import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useAccount, useSignMessage } from "wagmi";
import LitJsSdk from "@lit-protocol/sdk-browser";
import { 
  getLocalEncryptedUserCredentials, 
  decryptObjectWithLit, 
  encryptObject,
  getLocalProofMetadata,
  setLocalEncryptedProofMetadata,
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
} from "../constants/misc";
import ConnectWallet from "./atoms/ConnectWallet";
import proofContractAddresses from "../constants/proofContractAddresses.json";
import residencyStoreABI from "../constants/abi/zk-contracts/ResidencyStore.json";
import antiSybilStoreABI from "../constants/abi/zk-contracts/AntiSybilStore.json";

import { Success } from "./success";
import { Oval } from "react-loader-spinner";
import { truncateAddress } from "../utils/ui-helpers";
import RoundedWindow from "./RoundedWindow";
import { getExtensionState } from "../utils/extension-helpers";
import { useLitAuthSig } from "../context/LitAuthSig";
import { useHoloAuthSig } from "../context/HoloAuthSig";

const ConnectWalletScreen = () => (
  <>
    <ConnectWallet />
    <div className="x-container w-container">
        <h1>Please Connect Your Wallet First</h1>
    </div>
  </>
);

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const Proofs = () => {
  const params = useParams();
  const [creds, setCreds] = useState();
  const [success, setSuccess] = useState();
  const [error, setError] = useState();
  const [proof, setProof] = useState();
  const [submissionConsent, setSubmissionConsent] = useState(false);
  const [readyToLoadCreds, setReadyToLoadCreds] = useState();
  const [es, setES] = useState();
  const [reasonForHoloAuthSig, setReasonForHoloAuthSig] = useState() // 'get-creds' | 'store-proof-metadata'
  const [proofMetadataParams, setProofMetadataParams] = useState()
  const { litAuthSig, setLitAuthSig } = useLitAuthSig();
  const { data: account } = useAccount();
  const {
    signHoloAuthMessage,
    holoAuthSig,
    holoAuthSigDigest,
    holoAuthSigIsError,
    holoAuthSigIsLoading,
    holoAuthSigIsSuccess,
  } = useHoloAuthSig();
  
  const proofs = {
    "us-residency": {
      name: "US Residency",
      loadProof: loadPoR,
      contractAddress: proofContractAddresses["optimistic-goerli"]["ResidencyStore"],
      contractABI: residencyStoreABI,
    },
    uniqueness: {
      name: "Uniqueness",
      loadProof: loadAntiSybil,
      contractAddress: proofContractAddresses["optimistic-goerli"]["AntiSybilStore"],
      contractABI: antiSybilStoreABI,
    },
  };

  async function loadPoR() {
    const salt =
      "18450029681611047275023442534946896643130395402313725026917000686233641593164"; // this number is poseidon("IsFromUS")
    console.log('creds.newSecret...', creds.newSecret)
    const footprint = await poseidonTwoInputs([
      salt,
      ethers.BigNumber.from(creds.newSecret).toString(),
    ]);

    const por = await proofOfResidency(
      account.address,
      serverAddress,
      salt,
      footprint,
      creds.countryCode,
      creds.subdivisionHex,
      creds.completedAtHex,
      creds.birthdateHex,
      creds.newSecret
    );
    setProof(por);
  }

  async function loadAntiSybil() {
    const actionId = params.actionId || defaultActionId;
    if (!params.actionId)
      console.error(
        `Warning: no actionId was given, using default of ${defaultActionId} (generic cross-action sybil resistance)`
      );
    console.log("actionId", actionId);
    const footprint = await poseidonTwoInputs([
      actionId,
      ethers.BigNumber.from(creds.newSecret).toString(),
    ]);
    console.log("footprint", footprint);
    const as = await antiSybil(
      account.address,
      serverAddress,
      actionId,
      footprint,
      creds.countryCode,
      creds.subdivisionHex,
      creds.completedAtHex,
      creds.birthdateHex,
      creds.newSecret
    );
    setProof(as);
    console.log("proof is", JSON.stringify(as));
  }

  async function decryptAndSetCreds(encryptedCredentials, encryptedSymmetricKey) {
    const sortedCreds = await decryptObjectWithLit(encryptedCredentials, encryptedSymmetricKey)
    if (sortedCreds) {
      const c = sortedCreds[serverAddress];
      setCreds({
        ...c,
        subdivisionHex: "0x" + Buffer.from(c.subdivision).toString("hex"),
        completedAtHex: getDateAsInt(c.completedAt),
        birthdateHex: getDateAsInt(c.birthdate),
      });
    } else {
      setError(
        "Could not retrieve credentials for proof. Please make sure you have minted your Holo."
      );
    }
  }

  useEffect(() => {
    if (!readyToLoadCreds) return;
    async function getCreds() {
      const localEncryptedCreds = await getLocalEncryptedUserCredentials()
      if (!localEncryptedCreds) {
        // If no localEncryptedCreds, then this flow must be continued in the next 
        // useEffect, after the user signs the message
        setReasonForHoloAuthSig('get-creds')
        signHoloAuthMessage()
        return;
      }
      const { sigDigest, encryptedCredentials, encryptedSymmetricKey } = localEncryptedCreds
      await decryptAndSetCreds(encryptedCredentials, encryptedSymmetricKey)
    }
    getCreds();
  }, [readyToLoadCreds]);

  // This useEffect triggers if creds must be retrieved from Holonym db instead of 
  // from localStorage OR if proof metadata needs to be sent to server
  useEffect(() => {
    if (!holoAuthSig && !holoAuthSigDigest) return;
    if (holoAuthSigIsError) {
      throw new Error('Failed to sign Holonym authentication message needed to store proof metadata.')
    }
    async function getCreds() {
      const sigDigest = holoAuthSigDigest ? holoAuthSigDigest : await sha256(holoAuthSig);
      const resp = await fetch(`${idServerUrl}/credentials?sigDigest=${sigDigest}`)
      const data = await resp.json();
      if (!data) {
        throw new Error("Could not retrieve credentials for proof. Please make sure you have minted your Holo.");
      }
      const { 
        sigDigest: retrievedSigDigest, 
        encryptedCredentials, 
        encryptedSymmetricKey 
      } = data;
      await decryptAndSetCreds(encryptedCredentials, encryptedSymmetricKey)
    }
    async function callStoreProofMetadata() {
      const { tx, proofType, actionId, authSig } = proofMetadataParams
      const sigDigest = holoAuthSigDigest ? holoAuthSigDigest : await sha256(holoAuthSig)
      await storeProofMetadata(tx, proofType, actionId, authSig, sigDigest)
      setSuccess(true);
    }
    try {
      if (reasonForHoloAuthSig === 'get-creds') {
        getCreds();
      }
      else if (reasonForHoloAuthSig === 'store-proof-metadata') {
        callStoreProofMetadata()
      }
    } catch (err) {
      console.log(err);
      setError(`Error: ${err.message}`);
    }
  }, [holoAuthSig])

  useEffect(() => {
    if (!account?.address) return;
    if (!creds) return;
    if (!(params.proofType in proofs)) return;
    proofs[params.proofType].loadProof();
  }, [creds]);

  useEffect(() => {
    if (account?.address) setReadyToLoadCreds(true);
  }, [account]);

  useEffect(() => {
    if (!(submissionConsent && creds && proof)) return;
    submitTx(
      proofs[params.proofType].contractAddress,
      proofs[params.proofType].contractABI
    );
  }, [proof, submissionConsent]);

  if (account && !window.ethereum) {
    setError("Currently, this only works with MetaMask");
    return;
  }

  async function submitTx(addr, abi) {
    console.log("submitting");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x1a4",
          rpcUrls: ["https://goerli.optimism.io/"],
          chainName: "Optimism Goerli Testnet",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          blockExplorerUrls: ["https://goerli-optimism.etherscan.io"],
        },
      ],
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const resStore = new ethers.Contract(addr, abi, signer);
    try {
      const result = await resStore.prove(
        Object.keys(proof.proof).map((k) => proof.proof[k]), // Convert struct to ethers format
        proof.inputs
      );
      // TODO: At this point, display message to user that they are now signing to store their proof metadata
      const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain: chainUsedForLit })
      setLitAuthSig(authSig);
      if (holoAuthSig || holoAuthSigDigest) {
        const sigDigest = holoAuthSigDigest ? holoAuthSigDigest : await sha256(holoAuthSig)
        await storeProofMetadata(result, params.proofType, params.actionId, authSig, sigDigest)
        setSuccess(true);
      }
      else {
        setReasonForHoloAuthSig('store-proof-metadata')
        setProofMetadataParams({
          tx: result,
          proofType: params.proofType,
          actionId: params.actionId,
          authSig: authSig,
        })
        signHoloAuthMessage()
      }
    } catch (e) {
      setError(e.reason);
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

  return (
    // <Suspense fallback={<LoadingElement />}>
    <RoundedWindow>
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
        {!account?.address ? (
          <ConnectWalletScreen />
        ) : (
          <>
            <h3>Prove {proofs[params.proofType].name}</h3>
                <div className="spacer-med" />
                <br />
                {error ? (
                  <p>Error: {error}</p>
                ) : (
                  <>
                  {creds ? (
                    <p>
                      This will prove you (
                      <code>{truncateAddress(account.address)})</code> have the
                      attribute: <code>{proofs[params.proofType].name}</code>. It
                      may take 5-15 seconds to load.
                    </p>
                    ) : (
                    <>
                      <p>
                        Please sign the messages in the wallet popup so your proof can be generated.
                      </p>
                      <p>
                        &nbsp;Note: You cannot generate proofs before minting a holo. If you have not
                        already, please <a href="/mint" style={{ color: '#fdc094'}}>mint your holo</a>.
                      </p>
                    </>
                    )}
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
          </>
        )}
    </div>
    </RoundedWindow>
    // </Suspense>
  );
};

export default Proofs;
