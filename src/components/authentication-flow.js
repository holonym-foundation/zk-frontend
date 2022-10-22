import { ApproveJWT, MessageScreen, FinalScreen } from "./authentication-flow-atoms";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import  chainParams from "../constants/chainParams.json";
import { appIDForChain, chainForAppID } from "../constants/chainsAndAuds";
import contractAddresses from "../constants/contractAddresses.json";
import abi from "../constants/abi/VerifyJWTv2.json";
// import { LitCeramic } from "./lit-ceramic.js";
import NavSearch from "./atoms/NavSearch";
import Error from "./errors";
import { useAccount, useNetwork, useSigner, useProvider } from "wagmi"; // NOTE: Need wagmi for: account, provider, connect wallet
import { getParamsForVerifying, hexToString, parseJWT, sandwichDataWithBreadFromContract } from "wtfprotocol-helpers";
import MyHolo from "./MyHolo";

const { ethers } = require("ethers");

const JWTFromURL = function (url) {
  if (!url) {
    return null;
  }
  let parsedToJSON = {};
  url.split("&").map((x) => {
    let [key, value] = x.split("=");
    parsedToJSON[key] = value;
    return null
  });
  return parsedToJSON["id_token"];
};

let pendingProofPopup = false;

const InnerAuthenticationFlow = (props) => {
  const params = useParams();
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const { activeChain } = useNetwork(); 

  const provider = useProvider();
  let tokenURL = params.token || props.token; // Due to redirects with weird urls from some OpenID providers, there can't be a uniform way of accessing the token from the URL, so props based on window.location are used in weird situations
  const [vjwt, setVjwt] = useState(null);
  const [step, setStep] = useState(null);
  const [JWTText, setJWTText] = useState("");
  const [JWTObject, setJWTObject] = useState(""); //a fancy version of the JWT we will use for this script
  const [params4Verifying, setParams4Verifying] = useState({});
  const [displayMessage, setDisplayMessage] = useState("");
  const [onChainCreds, setOnChainCreds] = useState(null);


  // const [txHash, setTxHash] = useState(null);
  // const [credentialsRPrivate, setCredentialsRPrivate] = useState(false);

  

  // useEffect(()=>{if(token){setJWTText(token); setStep('userApproveJWT')}}, []) //if a token is provided via props, set the JWTText as the token and advance the form past step 1

  // if a token is already provided, set the step to user approving the token
  if (tokenURL) {
    if (JWTText === "") {
      setJWTText(JWTFromURL(tokenURL));
      setStep("userApproveJWT");
    }
  } else {
    if (step) {
      setStep(null);
    }
  }

  useEffect(() => {
    async function setJWTAndParams() {
      if (!(JWTText && signer && props && props.credentialClaim)) {
        return;
      }
      const parsedJWT = parseJWT(JWTText);
      setJWTObject(parsedJWT);
      console.log('gaa', chainForAppID[parsedJWT?.payload?.parsed?.aud])
      const vjwt_ = new ethers.Contract(
        contractAddresses[chainForAppID[parsedJWT?.payload?.parsed?.aud]][props.web2service],
        abi, 
        signer
      );
      setVjwt(vjwt_);
      try {
        // let rand = Math.random()
        // console.log('abc', rand, provider, vjwt_, JWTText, props.credentialClaim)
        // console.log(await getParamsForVerifying(vjwt_, JWTText, props.credentialClaim, "ethersjs"), 'abc', rand)
        setParams4Verifying(await getParamsForVerifying(vjwt_, JWTText, props.credentialClaim, "ethersjs"));
      } catch(e) {
        console.log("Error", e)
      }
    }
    setJWTAndParams();
  }, [JWTText, params, props, signer]);

  if (!account) {
    return  <div className="x-section bg-img wf-section" style={{ width: "100vw" }}>
         <div className="x-container w-container">
            <div className="x-wrapper no-flex">
              <div className="spacer-large larger"></div>
         <div className="x-wrapper small-center">
          
        <h1>Connect your wallet to continue</h1>
        </div>
        </div>
        </div>
      </div>
  }

  const commitJWTOnChain = async (credentialClaim) => {
    setDisplayMessage(
      "Please confirm the transaction. Please then wait 10-30 seconds (to prevent frontrunning)."
    );
    // xor the values as bytes (without preceding 0x)
    const commitments = params4Verifying.generateCommitments(account.address);
    try {
      await vjwt.commitJWTProof(...commitments);
      // revealBlock = (await provider.getBlockNumber()) + 1;
      let revealed = false;
      provider.on("block", async () => {
        // Don't reveal unless params were successfully committed:
        if (((await vjwt.commitments(commitments[0]))[0] === commitments[1]) && !revealed) {
          
          setStep("waitingForBlockCompletion");
          revealed = true;
        }
      });
    } catch (error) {
      console.log("commitment eror", error);
      props.errorCallback(error.data?.message || error.message);
    }

    // setStep('waitingForBlockCompletion')
  };

  // credentialField is 'email' for gmail and 'sub' for orcid. It's the claim of the JWT which should be used as an index to look the user up by
  const proveIKnewValidJWT = async () => {
    const p4v = params4Verifying.verifyMeContractParams();
    try {
      let tx = await vjwt.verifyMe(...p4v);
      // setTxHash(tx.hash);
      return tx;
    } catch (error) {
      props.errorCallback(error.data?.message || error.message);
    }
  };

  // Commenting out anonymous credentials for now
  // const submitAnonymousCredentials = async (vjwt, JWTObject) => {
  //   let message = JWTObject.header.raw + '.' + JWTObject.payload.raw
  //   let sig = JWTObject.signature.decoded
  //   try {
  //     let tx = await vjwt.linkPrivateJWT(ethers.BigNumber.from(sig), ethers.utils.sha256(ethers.utils.toUtf8Bytes(message)))
  //     setTxHash(tx.hash)
  //     return tx
  //   } catch (error) {
  //     props.errorCallback(error.data?.message || error.message)
  //   }

  // }

  // listen for the transaction to go to the mempool
  // props.provider.on('pending', async () => console.log('tx'))

  switch (step) {
    case "waitingForBlockCompletion":
      if (!pendingProofPopup) {
        pendingProofPopup = true;
        // this should be multiple functions eventually instead of convoluded nested loops
        // if (credentialsRPrivate) {
          // Commenting out anonymous credentials for now
          // submitAnonymousCredentials(vjwt, JWTObject).then(tx => {
          //   props.provider.once(tx, async () => {
          //     console.log('WE SHOULD NOTIFY THE USER WHEN THIS FAILS')
          //     // setStep('final');
          //   })
          // })
        // } else {
          proveIKnewValidJWT().then((tx) => {
            provider.once(tx, async () => {
              await setOnChainCreds(hexToString(await vjwt.credsForAddress(account.address)));
              setStep("final");
            });
          });
        // }
      }
      return <MessageScreen msg="A new popup will show soon. Press confirm to finish verifying your account." />
      // return credentialsRPrivate ? (
      //   <LitCeramic provider={provider} stringToEncrypt={JWTObject.header.raw + "." + JWTObject.payload.raw} />
      // ) : (
      //   <MessageScreen msg="Waiting for block to be mined" />
      // );
    case "final":
      // for some reason, onChainCreds updates later on Gnosis, so adding another fallback option for taking it off-chain (otherwise it will say verification failed when it probably hasn't failed; it just isn't yet retrievable)
      console.log("NU CREDS", JWTObject.payload.parsed[props.credentialClaim]);
      let creds = onChainCreds || JWTObject.payload.parsed[props.credentialClaim];

      try {
        fetch(`https://sciverse.id/api/updateDatabase?${account.address}`);
      } catch (err) {
        console.log(err)
      }

      return onChainCreds ? (
        <FinalScreen {...props} creds={creds}/>
      ) : (
        <Error msg="Failed to verify JWT on-chain" />
      );

    case "userApproveJWT":
      const chainNameFromToken = chainForAppID[JWTObject?.payload?.parsed?.aud]
      if (!JWTObject) {
        return <Error msg="Please connect your wallet and/or refresh the page" />
      }
      if(!(chainParams[chainNameFromToken]?.chainId !== activeChain?.id)) {
        return <Error msg={`Couldn't autoswitch to ${chainNameFromToken}. Please manually switch your wallet to ${chainNameFromToken}. This error often occurs on mobile browsers. If you're on a mobile browser, please instead open the website in MetaMask's mobile browser. I wish there was an easier way. Thanks for your patience`} />
      }
      // if (!desiredChain){
        // return <Error msg={`No blockchain specified. You should not be seeing this error -- If so, please contact us`} />
      // }
      // if(!desiredChainActive) {
      //   return <Error msg={`Couldn't autoswitch to ${desiredChain}. Please manually switch your wallet to ${desiredChain}. This error often occurs on mobile browsers. If you're on a mobile browser, please instead open the website in MetaMask's mobile browser. I wish there was an easier way. Thanks for your patience`} />
      // }
      try {
        vjwt?.kid().then((kid) => {
          if (JWTObject?.header?.parsed?.kid !== kid) {
            console.log("kid", JWTObject.header.parsed.kid, kid);
            props.errorCallback(
              <p>
                KID does not match KID on-chain. This likely means {props.web2service} has rotated their keys and those key IDs need to be updated
                on-chain. Please check back later. We would appreciate it if you could email{" "}
                <a href="mailto:wtfprotocol@gmail.com">wtfprotocol@gmail.com</a> about this error so we can get {props.web2service} up and running{" "}
              </p>
            );
          }
      });
    } catch(error) {
      props.errorCallback(error.data?.message || error.message);
    }

      return displayMessage ? (
        <MessageScreen msg={displayMessage} />
      ) : (
        <ApproveJWT account={account} callback={async () => {await commitJWTOnChain(JWTObject)}} JWTObject={JWTObject} />
      );
    

    default:
      return <MyHolo />;
  }
};

const AuthenticationFlow = (props) => {
  const [error, setError] = useState();

  useEffect(() => {
    const search = window.location.search;
    const searchParams = new URLSearchParams(search);

    // Set variables that are used in sign up with holo
    if (searchParams.get('siteurl') && searchParams.get('sitetitle')) {
      sessionStorage.setItem('signUpWithHoloSiteUrl', searchParams.get('siteurl'));
      sessionStorage.setItem('signUpWithHoloSiteTitle', searchParams.get('sitetitle'));
    }
  }, [])

  // return <Error msg={`Under maintenance...should be back up in a few hours  :) `} />
  return error ? <Error msg={error} /> : 
  <>
  <NavSearch />
  <InnerAuthenticationFlow {...props} errorCallback={(err) => setError(err)} />
  </>;
};

export default AuthenticationFlow;
