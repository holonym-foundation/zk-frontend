import { usePrepareContractWrite, useContractWrite } from "wagmi";
import { parseEther } from 'viem'
import { TransactionResponse } from "@ethersproject/providers";
import contractAddresses from "../../constants/contract-addresses.json";
import { jsonABIs } from "../../constants/abis";

type SubmitProofProps = {
  proof: any;
  contractName: keyof typeof contractAddresses;
  chain:
    | keyof (typeof contractAddresses)["SybilResistanceV2"]["mainnet"]
    | keyof (typeof contractAddresses)["SybilResistanceV2"]["testnet"];
  onSuccess?:
    | ((data: TransactionResponse) => void)
    | ((data: TransactionResponse) => Promise<void>);
  onError?: (error: any) => void;
};

/**
 * @param chain - Should be a value supported by all contracts in contract-addresses.json ('optimism' or 'optimism-goerli')
 */
const useSubmitProof = ({
  proof,
  contractName,
  chain,
  onError,
}: SubmitProofProps) => {
  const contractMetadata = contractAddresses[contractName];
  const chainSpecificContractMetadata =
    contractMetadata[chain === "optimism-goerli" ? "testnet" : "mainnet"];
  const contractAddress =
    chainSpecificContractMetadata[
      chain as keyof typeof chainSpecificContractMetadata
    ];

  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: jsonABIs[contractName],
    functionName: 'prove',
    args: proof
      ? [
          Object.keys(proof.proof).map((k) => proof.proof[k]), // Convert struct to ethers format
          proof.inputs,
        ]
      : [],
    value: contractName.includes("Sybil")
      ? parseEther("0.005")
      : undefined,
    onError: onError,
  })
  return useContractWrite({
    ...config,
    onError: onError,
  })
};

export default useSubmitProof;
