import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { ThreeDots } from "react-loader-spinner";
import { idServerUrl } from "../../constants/misc";
import { /*onAddLeafProof, handle-issuer-response's onAddLeafProof function should be here*/ proveKnowledgeOfLeafPreimage } from "../../utils/proofs";
import { getCredentials, storeCredentials } from "../../utils/secrets";
import Relayer from "../../utils/relayer";
import { useLitAuthSig } from '../../context/LitAuthSig';
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";
import { onAddLeafProof } from "./handle-issuer-response";
/* This function generates the leaf and adds it to the smart contract via the relayer.*/


const MintButton = ({ creds, onSuccess }) => {
    const [minting, setMinting] = useState();
    const [error, setError] = useState();
    const { litAuthSig } = useLitAuthSig();
    const { holoAuthSigDigest } = useHoloAuthSig();
    const { holoKeyGenSigDigest } = useHoloKeyGenSig();

    async function sendCredsToServer() {
      console.log('generating proof of knowledge of leaf preimage')
      const proof = await proveKnowledgeOfLeafPreimage(
        creds.creds.serializedcreds.creds.map(item => ethers.BigNumber.from(item || "0").toString()),
        creds.creds.newSecret
      );
      const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig, false);
      const success = await storeCredentials(sortedCreds, holoKeyGenSigDigest, holoAuthSigDigest, litAuthSig, proof);
      if (!success) {
        setError('Error: Could not send credentials to server.')
      }
    }

    async function addLeaf() {
        setMinting(true);
        // const newSecret = creds.creds.newSecret;
        const circomProof = await onAddLeafProof(creds);
        console.log("circom proooooof", circomProof);
        // const oalProof = await onAddLeafProof(
        //   creds.creds.serializedcreds.creds.map(x=>ethers.BigNumber.from(x || "0").toString()),
        //   newSecret
        // );
        // let abc = [...creds.creds.serializedCreds]
        // abc[2] = newSecret;
        // console.log("creds2", creds.creds.serializedCreds[2])
        // console.log("serialzed creds with secret: ", JSON.stringify(abc.map(x=>ethers.BigNumber.from(x).toString())));
        // console.log("oalProof", JSON.stringify(oalProof));
      //   const mintingArgs = {
      //     issuer: creds.creds.issuer,
      //     signature: ethers.utils.splitSignature(creds.creds.signature),
      //     proof: oalProof
      // }
      // console.log("minting args", JSON.stringify(mintingArgs))
        const result = await Relayer.mint(circomProof, async () => {
          await sendCredsToServer();
          onSuccess();
        });
    }

    return <div style={{ textAlign: "center" }}>
      <button className="mint-button" onClick={addLeaf}>
        <div style={{ 
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          {minting ? "Minting" : "Mint Your Holo"}
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

      <p style={{ marginTop: '20px' }}>
        Do not refresh the page during minting. Otherwise the mint could fail.
      </p>
      
      <p style={{color:"red"}}>{error}</p>
    </div>
}

export default MintButton;
