import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { ThreeDots } from "react-loader-spinner";
import { onAddLeafProof } from "../../utils/proofs";
import { getLocalEncryptedUserCredentials } from "../../utils/secrets";
import Relayer from "../../utils/relayer";
/* This function generates the leaf and adds it to the smart contract via the relayer.*/



const MintButton = (props) => {
    const [minting, setMinting] = useState();
    const [error, setError] = useState();
    const creds = props.creds;
    async function addLeaf() {
        setMinting(true);
        const newSecret = creds.newSecret;
        const oalProof = await onAddLeafProof(
          creds.serializedCreds.map(x=>ethers.BigNumber.from(x || "0").toString()),
          newSecret
        );
        console.log("oalProof", oalProof);
        const { v, r, s } = ethers.utils.splitSignature(creds.signature);
        const encryptedCredsObj = await getLocalEncryptedUserCredentials();
        const result = await Relayer.mint(
          {
            addLeafArgs: {
              issuer: creds.issuer,
              v: v,
              r: r,
              s: s,
              zkp: oalProof.proof,
              zkpInputs: oalProof.inputs,
            },
            credsToStore: {
              sigDigest: encryptedCredsObj.sigDigest,
              encryptedCredentials: encryptedCredsObj.encryptedCredentials,
              encryptedSymmetricKey: encryptedCredsObj.encryptedSymmetricKey
            }
          },
          props.onSuccess,
          () => setError("There was an error in submitting your transaction...perhaps you have already minted a Holo?")
        );
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