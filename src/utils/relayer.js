import axios from "axios";
import { relayerUrl } from "../constants/misc";
console.log("relayer url is ", relayerUrl)
const Relayer = {
    /* mint() argument 'args' is an object with format 
     {
            addLeafArgs: {
              issuer: <credential issuer address>
              v: <v of ethers signature>
              r: <r of ethers signature>
              s: <s of ethers signature>
              zkp: <onAddLeaf proof's proof object >
              zkpInputs: <onAddLeaf proof's inputs object>
            },
          }
    */
    mint : async function(args, onSuccess, onError) {
        let res;
        let error;
        try {
          res = await axios.post(`${relayerUrl}/v2/addLeaf`, args);
          if (res.status == 200) {
            onSuccess(res);
          }
        } catch (e) {
            (onError && onError(e))
            error = e;
          
        }
        return res || {error:error};
    },

    
    prove : async (proof, contractName, network, onSuccess, onError) => 
      axios.post(`${relayerUrl}/writeProof/${contractName}/${network}`, { writeProofArgs: proof }).then(res => res.data),

    getTree : async function(network, onError) {
        let res;
        let error;
        try {
          const response = await axios.get(`${relayerUrl}/v2/getTree/`)
          res = response.data;

        } catch (e) {
            (onError && onError(e))
            error = e;
          
        }
        return res || error;
    }
}

export default Relayer;