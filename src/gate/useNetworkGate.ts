import { useNetwork } from "wagmi";
import { desiredChainId } from "../constants";
import { ActiveChain } from "../types";

export default function useNetworkGate(gate: (data: ActiveChain) => boolean) {
  const {
    activeChain,
    chains,
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    switchNetwork,
    switchNetworkAsync,
  } = useNetwork({
    chainId: desiredChainId,
  });

  return gate({ activeChain });
}
