import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { ThreeDots } from "react-loader-spinner";
import { idServerUrl } from "../../constants/misc";
import { onAddLeafProof, proveKnowledgeOfLeafPreimage } from "../../utils/proofs";
import { getLocalEncryptedUserCredentials } from '../../utils/secrets'

/* This function generates the leaf and adds it to the smart contract via the relayer.*/



const MintButton = (props) => {
    const [minting, setMinting] = useState();
    const [error, setError] = useState();
    const creds = props.creds;

    async function sendCredsToServer() {
      const proof = await proveKnowledgeOfLeafPreimage(
        creds.serializedCreds.map(item => ethers.BigNumber.from(item || "0").toString()),
        creds.newSecret
      );
      const { sigDigest, encryptedCredentials, encryptedSymmetricKey } = getLocalEncryptedUserCredentials()
      const reqBody = {
        sigDigest: sigDigest,
        proof: proof,
        encryptedCredentials: encryptedCredentials,
        encryptedSymmetricKey: encryptedSymmetricKey,
      }
      await fetch(`${idServerUrl}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody)
      })
    }

    async function addLeaf() {
        setMinting(true);
        const oldSecret = creds.secret;
        const newSecret = creds.newSecret;
        const oalProof = await onAddLeafProof(
          creds.serializedCreds.map(x=>ethers.BigNumber.from(x || "0").toString()),
          newSecret
        );
        console.log("oalProof", oalProof);
        const { v, r, s } = ethers.utils.splitSignature(creds.signature);
        const RELAYER_URL = "https://relayer.holonym.id";
        let res;
        const encryptedCredsObj = getLocalEncryptedUserCredentials()
        try {
          res = await axios.post(`${RELAYER_URL}/addLeaf`, {
            addLeafArgs: {
              issuer: creds.issuer,
              v: v,
              r: r,
              s: s,
              zkp: oalProof.proof,
              zkpInputs: oalProof.inputs,
            },
            // TODO: Remove credsToStore once relayer no longer forwards creds to server
            credsToStore: {
              sigDigest: encryptedCredsObj.sigDigest,
              encryptedCredentials: encryptedCredsObj.encryptedCredentials,
              encryptedSymmetricKey: encryptedCredsObj.encryptedSymmetricKey
            }
          });
          if (res.status == 200) {
            await sendCredsToServer();
            // These are the same; latter is a better name but keeping former for backwards compatibility:
            props.successCallback && props.successCallback();
            props.onSuccess && props.onSuccess();
            
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

    return <div style={{ textAlign: "center" }}>
      <button className="mint-button" onClick={addLeaf}>
        <div style={{ 
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
        Mint Your Holo
        {minting && !error && <ThreeDots 
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

      
      <p style={{color:"red"}}>{error}</p>
    </div>
}

export default MintButton;