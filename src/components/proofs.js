import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { requestCredentials } from "../utils/secrets";
import {
  getDateAsInt,
  poseidonTwoInputs,
  proofOfResidency,
  antiSybil,
} from "../utils/proofs";
import { serverAddress } from "../constants/misc";
import ConnectWallet from "./atoms/ConnectWallet";
import proofContractAddresses from "../constants/proofContractAddresses.json";
import residencyStoreABI from "../constants/abi/zk-contracts/ResidencyStore.json";
import antiSybilStoreABI from "../constants/abi/zk-contracts/AntiSybilStore.json";

import { Success } from "./success";
import { Oval } from "react-loader-spinner";
import { truncateAddress } from "../utils/ui-helpers";

const ConnectWalletScreen = () => (
  <>
    <ConnectWallet />
    <div className="x-container w-container">
      <div className="x-wrapper small-center" style={{ width: "100vw" }}>
        <h1>Please Connect Your Wallet First</h1>
      </div>
    </div>
  </>
);

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

const LoadingElement = (props) => <h3 style={{ textAlign: "center" }}>Loading...</h3>;
const Proofs = () => {
  const params = useParams();
  const [creds, setCreds] = useState();
  const [success, setSuccess] = useState();
  const [error, setError] = useState();
  const [proof, setProof] = useState();
  const [submissionConsent, setSubmissionConsent] = useState(false);
  const [readyToLoadCreds, setReadyToLoadCreds] = useState();

  const { data: account } = useAccount();
  
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
    const actionId = params.actionId || "123456789";
    if (!params.actionId)
      console.error(
        "Warning: no actionId was given, using default of 123456789 (generic cross-action sybil resistance)"
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

  useEffect(() => {
    if (!readyToLoadCreds) return;
    async function getCreds() {
      const sortedCreds = await requestCredentials();
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
          "Could not retrieve credentials for proof. Please make sure you have the Holonym extension installed and have minted your Holo."
        );
      }
    }
    getCreds();
  }, [readyToLoadCreds]);

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
    window.ethereum.request({
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
    return <div className="x-container w-container">
            <div className="x-wrapper small-center" style={{ width: "100vw" }}>
            <h3>Please install <a href="https://metamask.io/">Metamask</a></h3>
            </div>
          </div>
  }
  return (
    // <Suspense fallback={<LoadingElement />}>
    <div className="x-container w-container">
      <div className="x-wrapper small-center" style={{ width: "100vw" }}>
        {!account?.address ? (
          <ConnectWalletScreen />
        ) : (
          <>
            <h3>Prove {proofs[params.proofType].name}</h3>
            <div>
              <div>
                {error ? (
                  <p>Error: {error}</p>
                ) : (
                  <>
                    <p>
                      {creds ? (
                        <>
                          This will prove you (
                          <code>{truncateAddress(account.address)})</code> have the
                          attribute: <code>{proofs[params.proofType].name}</code>. It
                          may take 5-15 seconds to load.
                        </>
                      ) : (
                        `Please confirm the popup so your proof can be generated`
                      )}
                    </p>
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
            </div>
          </>
        )}
      </div>
    </div>
    // </Suspense>
  );
};

export default Proofs;
