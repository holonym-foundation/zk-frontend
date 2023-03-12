import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getCredentials } from "../../utils/secrets";
import {
  getDateAsInt,
  poseidonTwoInputs,
  proofOfResidency,
  antiSybil,
} from "../../utils/proofs";
import { 
  serverAddress, 
  clientPortalUrl, 
  defaultActionId,
} from "../../constants";
// import residencyStoreABI from "../constants/abi/zk-contracts/ResidencyStore.json";
// import antiSybilStoreABI from "../constants/abi/zk-contracts/AntiSybilStore.json";

import { Success } from "../success";
import { Oval } from "react-loader-spinner";
import { truncateAddress } from "../../utils/ui-helpers";
import RoundedWindow from "../RoundedWindow";
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";
import Relayer from "../../utils/relayer";
import ConnectWalletScreen from "../atoms/connect-wallet-screen";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [creds, setCreds] = useState();
  const [success, setSuccess] = useState();
  const [error, setError] = useState();
  const [customError, setCustomError] = useState();
  const [proof, setProof] = useState();
  const [submissionConsent, setSubmissionConsent] = useState(false);
  const [readyToLoadCreds, setReadyToLoadCreds] = useState();
  const { data: account } = useAccount();
  const { holoAuthSigDigest } = useHoloAuthSig();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();
  const sessionQuery = useQuery({
    queryKey: ["getSession"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      try {
        if (!searchParams.get("sessionId")) return { error: "No session id" };
        const sessionId = searchParams.get("sessionId");
        const resp = await fetch(`${clientPortalUrl}/api/sessions/${sessionId}`);
        return await resp.json();
      } catch (err) {
        console.error(err)
        return { error: err };
      }
    }
  })

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
    const creds_ = creds[serverAddress["idgov-v2"]]
    if (!creds_) {
      setCustomError(<p>To do this proof, your Holo must have a government ID. Please <a href="/issuance/idgov" style={{ color: '#fdc094'}}>add a government ID</a></p>);
      return;
    }
    const salt = "18450029681611047275023442534946896643130395402313725026917000686233641593164"; // this number is poseidon("IsFromUS")
    const footprint = await poseidonTwoInputs([
      salt,
      ethers.BigNumber.from(creds_.creds.newSecret).toString(),
    ]);

    const [issuer_, oldSecret_, countryCode_, nameCitySubdivisionZipStreetHash_, completedAt_, scope] = creds_.creds.serializedAsNewPreimage;
    const por = await proofOfResidency(
      account.address,
      issuer_,
      salt,
      footprint,
      countryCode_,
      nameCitySubdivisionZipStreetHash_,
      completedAt_,
      scope,
      creds_.creds.newSecret
    );
    // Once setProof is called, the proof is submited
    setProof(por);
    console.log("proof is", JSON.stringify(por));
  }

  async function loadAntiSybil() {
    const actionId = params.actionId || defaultActionId;
    if (!params.actionId)
      console.error(
        `Warning: no actionId was given, using default of ${defaultActionId} (generic cross-action sybil resistance)`
      );

    const govIdCreds = creds[serverAddress["idgov-v2"]]
    if (!govIdCreds) {
      setCustomError(<p>To do this proof, your Holo must have a government ID. Please <a href="/issuance/idgov" style={{ color: '#fdc094'}}>add a government ID</a></p>);
      return;
    }
    const as = await antiSybil(
      account.address,
      govIdCreds,
      actionId,
    );
    // Once setProof is called, the proof is submited
    setProof(as);
  }

  // Steps:
  // 1. Ensure user's wallet is connected (i.e., get account)
  // 2. Ensure sessionId and callback params are present
  // 3. Ensure sessionId is valid
  // 4. Get & set holoAuthSigDigest
  // 5. Get & set creds
  // 6. Get & set proof
  // 7. Redirect user to callback URL & include proof in query params

  useEffect(() => {
    (async () => {
      // Get sessionId and callback from URL
      const sessionId = searchParams.get("sessionId");
      const callbackUrl = searchParams.get("callback");
      if (!sessionId && !callbackUrl) setError("Missing sessionId and callback");
      if (!sessionId) setError("Missing sessionId");
      if (!callbackUrl) setError("Missing callback");

      // Ensure sessionId is valid
      // if (process.env.NODE_ENV === "development") {
      //   setReadyToLoadCreds(true);
      // }
      else if (sessionId && callbackUrl) {
        try {
          console.log('sessionQuery.data before refetch', sessionQuery.data)
          if (!sessionQuery.data) await sessionQuery.refetch() // manually call queryFn
          console.log('sessionQuery.data after refetch', sessionQuery.data)
          const returnedSessionId = sessionQuery?.data?.sessionId;
          if (returnedSessionId) setReadyToLoadCreds(true);
          else if (sessionQuery?.data.error) setError(sessionQuery?.data?.error?.message);
          else setError("Invalid sessionId");
        } catch (err) {
          console.error(err)
          setError("Invalid sessionId");
        }
      }
    })()
  }, [account, sessionQuery?.data]);

  useEffect(() => {
    if (!readyToLoadCreds) return;
    async function loadCreds() {
      console.log('Loading creds')
      const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest);
      if (sortedCreds) {
        setCreds(sortedCreds)
      } else {
        setError(
          "Could not retrieve credentials for proof. Please make sure you have verified yourself."
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
    redirectUserWithProof(proof);
  }, [proof, submissionConsent]);

  if (account && !window.ethereum) {
    setError("Currently, this only works with MetaMask");
    return;
  }

  async function redirectUserWithProof(proof) {
    const callback = searchParams.get("callback");
    const proofString = encodeURIComponent(JSON.stringify(proof));
    // TODO: Encrypt (at least part of) proof using client's public encryption key
    window.location.href = `${callback}?proof=${proofString}`;
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
                  <p style={{ color: "red", fontSize: "1rem" }}>Error: {error}</p>
                ) : (creds ? <p>
                        This will give you, 
                        <code> {truncateAddress(account.address)} </code>, 
                        a <a target="_blank" href="https://cointelegraph.com/news/what-are-soulbound-tokens-sbts-and-how-do-they-work" style={{ color: '#fdc094'}}>soul-bound token</a> (SBT)
                        showing only this one attribute of you: <code>{proofs[params.proofType].name}</code>. It
                        may take 5-15 seconds to load.
                      </p>
                    :
                      <p>
                        &nbsp;Note: You cannot generate proofs before verifying yourself. If you have not
                        already, please <a href="/issuance" style={{ color: '#fdc094'}}>verify yourself</a>.
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
  );
};

export default Proofs;
