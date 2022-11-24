import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useAccount, useSignMessage } from "wagmi";
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
} from "../constants/misc";
// import ConnectWallet from "./atoms/ConnectWallet";
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
    {/* <ConnectWallet /> */}
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


const Proofs = () => {
  const params = useParams();
  const [creds, setCreds] = useState();
  const [success, setSuccess] = useState();
  const [error, setError] = useState();
  const [proof, setProof] = useState();
  const [submissionConsent, setSubmissionConsent] = useState(false);
  const [readyToLoadCreds, setReadyToLoadCreds] = useState();
  const [es, setES] = useState();
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
    // console.log('creds.newSecret...', creds.newSecret)
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
    if (account?.address && !holoAuthSigDigest) {
      console.log('Requesting signature for holoAuthSigDigest')
      signHoloAuthMessage()
    }
    if (account?.address && holoAuthSigDigest) setReadyToLoadCreds(true);
  }, [account, holoAuthSigDigest]);

  useEffect(() => {
    if (!readyToLoadCreds) return;
    async function loadCreds() {
      console.log('Loading creds')
      let encryptedCredentials, encryptedSymmetricKey;
      const localEncryptedCreds = await getLocalEncryptedUserCredentials()
      if (localEncryptedCreds) {
        encryptedCredentials = localEncryptedCreds.encryptedCredentials
        encryptedSymmetricKey = localEncryptedCreds.encryptedSymmetricKey
      } else {
        const resp = await fetch(`${idServerUrl}/credentials?sigDigest=${holoAuthSigDigest}`)
        const data = await resp.json();
        if (!data) {
          setError("Error: Could not retrieve credentials for proof. Please make sure you have minted your Holo.");
        }
        encryptedCredentials = data.encryptedCredentials
        encryptedSymmetricKey = data.encryptedSymmetricKey
      }
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
    const proofContract = new ethers.Contract(addr, abi, signer);
    try {
      const result = await proofContract.prove(
        Object.keys(proof.proof).map((k) => proof.proof[k]), // Convert struct to ethers format
        proof.inputs
      );
      // TODO: At this point, display message to user that they are now signing to store their proof metadata
      const authSig = litAuthSig ? litAuthSig : await LitJsSdk.checkAndSignAuthMessage({ chain: chainUsedForLit })
      setLitAuthSig(authSig);
      await storeProofMetadata(result, params.proofType, params.actionId, authSig, holoAuthSigDigest)
      setSuccess(true);
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
                      {creds ? (
                        <>
                          This will give you, 
                          <code> {truncateAddress(account.address)} </code>, 
                          a soul-bound token (SBT)
                          showing only this one attribute of you: <code>{proofs[params.proofType].name}</code>. It
                          may take 5-15 seconds to load.
                        </>
                      ) : (
                        `Please confirm the popup so your proof can be generated`
                      )}
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
