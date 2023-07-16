import { ethers } from "ethers";
import { useContractWrite } from "wagmi";
import contractAddresses from '../../constants/contract-addresses.json'
import ABIs from "../../constants/abis";

/**
 * @param chain - Should be a value supported by all contracts in contract-addresses.json ('optimism' or 'optimism-goerli')
 */
const useSubmitProof = ({ proof, contractName, chain, onSuccess, onError }) => {
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    write,
    writeAsync,
  } = useContractWrite(
    {
      addressOrName: contractAddresses[contractName][
        chain === 'optimism-goerli' ? 'testnet' : 'mainnet'
      ][chain],
      contractInterface: ABIs[contractName],
      // signerOrProvider?: Signer | providers.Provider | null
    },
    'prove',
    {
      args: proof ? [
        Object.keys(proof.proof).map(k=>proof.proof[k]), // Convert struct to ethers format
        proof.inputs
      ] : [],
      overrides: {
        value: ethers.utils.parseEther("0.005"),
      },
      onSuccess: onSuccess,
      onError: onError,
    }
  )

  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    write,
    writeAsync,
  }
};

export default useSubmitProof;
