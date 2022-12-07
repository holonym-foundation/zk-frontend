import axios from "axios";
import { relayerUrl } from "../constants/misc";

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
            credsToStore: {
              sigDigest: <sigDigest from getLocalEncryptedUserCredentials() response>
              encryptedCredentials: <encryptedCredentials from getLocalEncryptedUserCredentials() response>
              encryptedSymmetricKey: <encryptedSymmetricKey from getLocalEncryptedUserCredentials() response>
            }
          }
    */
    mint : async function(args, onSuccess, onError) {
        let res;
        let error;
        try {
          res = await axios.post(`${relayerUrl}/addLeaf`, args);
          if (res.status == 200) {
            onSuccess(res);
          }
        } catch (e) {
            (onError && onError(e))
            error = e;
          
        }
        return res || error;
    },
    prove : function() {
        
    }
}

export default Relayer;