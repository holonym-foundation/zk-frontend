import { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import { onAddLeafProof } from "../../utils/proofs";
import Relayer from "../../utils/relayer";
import { useCreds } from "../../context/Creds";
import { useProofs } from "../../context/Proofs";
/* This function generates the leaf and adds it to the smart contract via the relayer.*/


const MintButton = ({ creds, onSuccess }) => {
    const [minting, setMinting] = useState();
    const [error, setError] = useState();
    const [readyToSendToServer, setReadyToSendToServer] = useState(false);
    const { sortedCreds, loadingCreds, reloadCreds, storeCreds } = useCreds();
    const { loadKOLPProof, kolpProof } = useProofs();

    async function sendCredsToServer() {
      const sortedCreds = await reloadCreds();
      const success = await storeCreds(sortedCreds, kolpProof);
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
            loadKOLPProof(creds.creds.newSecret, creds.creds.serializedAsNewPreimage)
            setReadyToSendToServer(true);
          }, 
          () => {
            setError('Error: An error occurred while minting.')
          }
        );
    }

    // Steps:
    // 1. Generate addLeaf proof and call relayer addLeaf endpoint
    // 2. Generate KOLP proof using creds in newly added leaf, send to server, and call onSuccess
    useEffect(() => {
      if (!kolpProof || !readyToSendToServer) return;
      sendCredsToServer()
        .then(onSuccess);
    }, [kolpProof, readyToSendToServer])

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
