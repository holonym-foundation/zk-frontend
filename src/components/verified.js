import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { useParams } from "react-router-dom";

import {
  storeCredentials,
  getIsHoloRegistered,
  requestCredentials,
} from "../utils/secrets";
import { zkIdVerifyEndpoint, serverAddress } from "../constants/misc";
import {
  getStateAsHexString,
  getDateAsHexString,
  onAddLeafProof,
} from "../utils/proofs";
import { ThreeDots } from "react-loader-spinner";
import { Success } from "./success";

// For test credentials, see id-server/src/main/utils/constants.js
const dummyUserCreds = {
  countryCode: 2,
  subdivision: "New York",
  completedAt: "2022-09-16", // "2022-09-16T02:21:59.510Z",
  birthdate: "1950-01-01",
};

// Display success message, and retrieve user credentials to store in browser
const Verified = (props) => {
  const p = useParams();
  const jobID = p.jobID || props.jobID;
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [credsAreStored, setCredsAreStored] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [successScreen, setSuccessScreen] = useState(false);
  const [minting, setMinting] = useState(false);
  // TODO: Check whether user is logged in too
  const [creds, setCreds] = useState();

  async function getCredentials() {
    setError(undefined);
    setLoading(true);
    try {
      const resp = await fetch(
        `${zkIdVerifyEndpoint}/registerVouched/vouchedCredentials?jobID=${jobID}`
      );
      // Shape of data == { user: completeUser }
      const data = await resp.json();
      if (!data || data.error) {
        console.error(`Could not retrieve credentials. Details: ${data.error}`);
        return;
      } else {
        setLoading(false);
        const credsTemp = data.user;
        setCreds(credsTemp);
        return credsTemp;
      }
    } catch (err) {
      console.error(`Could not retrieve credentials. Details: ${err}`);
    }
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function waitForUserRegister() {
    let isRegistered = await getIsHoloRegistered();
    while (!isRegistered) {
      await sleep(100);
      isRegistered = await getIsHoloRegistered();
    }
  }

  async function setCredsFromExtension() {
    try {
      // Request credentials. Need to request because extension generates new secret
      const sortedCreds = await requestCredentials();
      const newCreds = sortedCreds[serverAddress];
      setCreds({
        ...newCreds,
        subdivisionHex: getStateAsHexString(
          newCreds.subdivision,
          newCreds.countryCode
        ),
        completedAtHex: getDateAsHexString(newCreds.completedAt),
        birthdateHex: getDateAsHexString(newCreds.birthdate),
      });
    } catch (e) {
      setError("There was a problem in storing your credentials");
    }
  }

  useEffect(() => {
    async function func() {
      const isRegistered = await getIsHoloRegistered();
      // Only setRegistered at this first check. If user had not registered before
      // reaching this page, we want to keep on the page the instructions for the
      // non-registered user
      setRegistered(isRegistered);
      if (!isRegistered) {
        await waitForUserRegister();
        setError(undefined);
      }
      const credsTemp = await getCredentials();
      if (!credsTemp) {
        setError(`Error: Could not retrieve credentials.`);
        return;
      }

      try {
        setCreds({
          ...credsTemp,
          subdivisionHex: getStateAsHexString(
            credsTemp.subdivision,
            credsTemp.countryCode
          ),
          completedAtHex: getDateAsHexString(credsTemp.completedAt),
          birthdateHex: getDateAsHexString(credsTemp.birthdate),
        });
      } catch (e) {
        console.error(
          `There was a problem in storing your credentials. Details: ${e}`
        );
        setError("Error: There was a problem in storing your credentials");
      }

      const success = await storeCredentials(credsTemp);
      setCredsAreStored(success);
      if (success)
        setCredsFromExtension();
      else {
        setError("Could not receive confirmation from user to store credentials");
      }
    }
    try {
      func();
    } catch (err) {
      console.log(err);
      setError(`Error: ${err.message}`);
    }
    // For tests
    // setLoading(false);
    // storeCredentials(dummyUserCreds).then(async (success) => {
    //   const sortedCreds = await requestCredentials();
    //   const newCreds = sortedCreds[serverAddress];
    //   setCreds({
    //     ...newCreds,
    //     subdivisionHex: getStateAsHexString(newCreds.subdivision),
    //     completedAtHex: getDateAsHexString(newCreds.completedAt),
    //     birthdateHex: getDateAsHexString(newCreds.birthdate),
    //   });
    //   setCredsAreStored(success);
    // });
  }, []);

  async function addLeaf() {
    setMinting(true);
    const oldSecret = creds.secret;
    const newSecret = creds.newSecret;
    const oalProof = await onAddLeafProof(
      serverAddress,
      creds.countryCode,
      creds.subdivisionHex,
      creds.completedAtHex,
      creds.birthdateHex,
      oldSecret,
      newSecret
    );
    console.log("oalProof", oalProof);
    const { v, r, s } = ethers.utils.splitSignature(creds.signature);
    const RELAYER_URL = "https://relayer.holonym.id";
    let res;
    try {
      res = await axios.post(`${RELAYER_URL}/addLeaf`, {
        addLeafArgs: {
          issuer: serverAddress,
          v: v,
          r: r,
          s: s,
          zkp: oalProof.proof,
          zkpInputs: oalProof.inputs,
        },
      });
      if (res.status == 200) {
        setSuccessScreen(true);
      }
    } catch (e) {
      console.log("There was an error:", e);
      setError(
        "There was an error in submitting your transaction...perhaps you have already minted a Holo?"
      );
    }
    console.log("result");
    console.log(res);
  }

  if (successScreen) {
    return <Success />;
  }
  console.log(creds, credsAreStored, registered)
  return (
    <>
      {loading ? (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
      }}>
      <h3 style={{ textAlign: "center", paddingRight:"10px"}}>Loading credentials</h3>
      <ThreeDots 
        height="20" 
        width="40" 
        radius="2"
        color="#FFFFFF" 
        ariaLabel="three-dots-loading"
        wrapperStyle={{marginBottom:"-20px"}}
        wrapperClassName=""
        visible={true}
        />
    </div>
        
      ) : (
        <div>
          <h3 style={{ textAlign: "center" }}>Almost finished!</h3>
          <br />
          <div style={{ maxWidth: "600px", fontSize: "16px" }}>
            <i>
              <ol>
                {!registered && (
                  <li>
                    <p>
                      Open the Holonym extension, and create an account by entering a
                      password (be sure to remember it)
                    </p>
                  </li>
                )}
                <li>
                  <p>
                    Login to the Holonym popup{" "}
                    {!registered && "(after creating an account)"}
                  </p>
                </li>
                <p>
                  <li>Confirm your credentials</li>
                </p>
                {/* <li>
                  <p>Share your credentials</p>
                  <p style={{ fontSize: ".8em" }}>
                    (The extension generates a new secret for you and requires your
                    consent to share it)
                  </p>
                </li> */}
                <li>
                  <p>Mint your Holo:</p>
                </li>
              </ol>
            </i>
            {creds && credsAreStored && (
              <div style={{ textAlign: "center" }}>
                <button className="x-button-blue" onClick={addLeaf}>
                  <div style={{ 
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                  Mint Your Holo
                  {minting && <ThreeDots 
                    height="20" 
                    width="20" 
                    radius="2"
                    color="#0F0F0F" 
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{marginLeft:"20px"}}
                    wrapperClassName=""
                    visible={true}
                    />}
                    </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <p>{error}</p>
      {error && (
        <p>
          Please email Holonym support at{" "}
          <a href="mailto:help@holonym.id">help@holonym.id</a> with a description of
          the error.
        </p>
      )}
    </>
  );
};

export default Verified;
