import { ethers } from "ethers";
import { useContractWrite } from "wagmi";
import { TransactionResponse } from "@ethersproject/providers";
import contractAddresses from "../../constants/contract-addresses.json";
import ABIs from "../../constants/abis";

type SubmitProofProps = {
  proof: any;
  contractName: keyof typeof contractAddresses;
  chain:
    | keyof (typeof contractAddresses)["SybilResistanceV2"]["mainnet"]
    | keyof (typeof contractAddresses)["SybilResistanceV2"]["testnet"];
  onSuccess?:
    | ((txResponse: TransactionResponse) => void)
    | ((txResponse: TransactionResponse) => Promise<void>);
  onError?: (error: any) => void;
};

/**
 * @param chain - Should be a value supported by all contracts in contract-addresses.json ('optimism' or 'optimism-goerli')
 */
const useSubmitProof = ({
  proof,
  contractName,
  chain,
  onSuccess,
  onError,
}: SubmitProofProps) => {
  const contractMetadata = contractAddresses[contractName];
  const chainSpecificContractMetadata =
    contractMetadata[chain === "optimism-goerli" ? "testnet" : "mainnet"];
  const contractAddress =
    chainSpecificContractMetadata[
      chain as keyof typeof chainSpecificContractMetadata
    ];

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
      addressOrName: contractAddress,
      contractInterface: ABIs[contractName],
      // signerOrProvider?: Signer | providers.Provider | null
    },
    "prove",
    {
      args: proof
        ? [
            Object.keys(proof.proof).map((k) => proof.proof[k]), // Convert struct to ethers format
            proof.inputs,
          ]
        : [],
      overrides: {
        value: contractName.includes("Sybil")
          ? ethers.utils.parseEther("0.005")
          : undefined,
      },
      onSuccess: onSuccess,
      onError: onError,
    }
  );

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
  };
};

export default useSubmitProof;
