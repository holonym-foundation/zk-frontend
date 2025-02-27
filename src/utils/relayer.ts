import axios from "axios";
import { relayerUrl } from "../constants";
const Relayer = {
  addLeaf: async function (
    args: any,
    onSuccess: (args: any) => void,
    onError?: (args: any) => void
  ) {
    let res;
    let error;
    try {
      res = await axios.post(`${relayerUrl}/v3/addLeaf`, args);
      if (res.status === 200) {
        onSuccess(res);
      }
    } catch (e) {
      onError?.(e);
      error = e;
    }
    return res || { error: error };
  },

  prove: async (
    proof: any,
    contractName: string,
    network: string,
    onSuccess?: (args: any) => void,
    onError?: (args: any) => void
  ) =>
    axios
      .post(`${relayerUrl}/writeProof/${contractName}/${network}`, {
        writeProofArgs: proof,
      })
      .then((res) => res.data),

  getTree: async function (network: string, onError?: (args: any) => void) {
    let res;
    let error;
    try {
      const response = await axios.get(`${relayerUrl}/v3/getTree/`);
      res = response.data;
    } catch (e) {
      onError?.(e);
      error = e;
    }
    return res || error;
  },

  getLeafExists: async function (leaf: string) {
    const response = await axios.get(`${relayerUrl}/v3/leafExists/${leaf}`);
    return response.data;
  }
};

export default Relayer;
