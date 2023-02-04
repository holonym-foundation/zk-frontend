import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { ThreeDots } from "react-loader-spinner";
import { idServerUrl } from "../../constants";
import { onAddLeafProof, proveKnowledgeOfLeafPreimage } from "../../utils/proofs";
import { getCredentials, storeCredentials } from "../../utils/secrets";
import Relayer from "../../utils/relayer";
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";
/* This function generates the leaf and adds it to the smart contract via the relayer.*/


const MintButton = ({ creds, onSuccess }) => {
    const [minting, setMinting] = useState();
    const [error, setError] = useState();
    const { holoAuthSigDigest } = useHoloAuthSig();
    const { holoKeyGenSigDigest } = useHoloKeyGenSig();

    async function sendCredsToServer() {
      console.log('generating proof of knowledge of leaf preimage')
      const proof = await proveKnowledgeOfLeafPreimage(
        creds.creds.serializedAsNewPreimage.map(item => ethers.BigNumber.from(item || "0").toString()),
        creds.creds.newSecret
      );
      const sortedCreds = await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, false);
      const success = await storeCredentials(sortedCreds, holoKeyGenSigDigest, holoAuthSigDigest, proof);
      if (!success) {
        setError('Error: Could not send credentials to server.')
      } else {
        // Remove plaintext credentials from local storage now that they've been backed up
        for (const key of Object.keys(window.localStorage)) {
          if (key.startsWith('holoPlaintextCreds')) {
            console.log('removing', key, 'from local storage')
            window.localStorage.removeItem(key);
          }
        }
      }
    }

    async function addLeaf() {
        setMinting(true);
        const circomProof = await onAddLeafProof(creds);
        console.log("circom proooooof", circomProof);
        const result = await Relayer.mint(
          circomProof, 
          async () => {
            await sendCredsToServer();
            onSuccess();
          }, 
          () => {
            setError('Error: An error occurred while minting.')
          }
        );
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
