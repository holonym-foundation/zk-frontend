import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { ThreeDots } from "react-loader-spinner";
import { onAddLeafProof } from "../../utils/proofs";
import { serverAddress } from "../../constants/misc";

/* This function generates the leaf and adds it to the smart contract via the relayer.*/



const MintButton = (props) => {
    const [minting, setMinting] = useState();
    const [error, setError] = useState();
    const creds = props.creds;
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
            props.successCallback && props.successCallback();
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