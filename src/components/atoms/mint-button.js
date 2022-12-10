import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { ThreeDots } from "react-loader-spinner";
import { idServerUrl } from "../../constants/misc";
import { onAddLeafProof, proveKnowledgeOfLeafPreimage } from "../../utils/proofs";
import { getLocalEncryptedUserCredentials } from "../../utils/secrets";
import Relayer from "../../utils/relayer";
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
        const newSecret = creds.newSecret;
        const oalProof = await onAddLeafProof(
          creds.serializedCreds.map(x=>ethers.BigNumber.from(x || "0").toString()),
          newSecret
        );
        // let abc = [...creds.serializedCreds]
        // abc[2] = newSecret;
        // console.log("creds2", creds.serializedCreds[2])
        // console.log("serialzed creds with secret: ", JSON.stringify(abc.map(x=>ethers.BigNumber.from(x).toString())));
        // console.log("oalProof", JSON.stringify(oalProof));
        const mintingArgs = {
          issuer: creds.issuer,
          signature: ethers.utils.splitSignature(creds.signature),
          proof: oalProof
      }
      // console.log("minting args", JSON.stringify(mintingArgs))
        const result = await Relayer.mint(mintingArgs,
          props.onSuccess
        );
        await sendCredsToServer();
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