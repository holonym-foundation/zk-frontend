import { useNetwork } from "wagmi";
import { ActiveChain } from "../types";

export default function useNetworkGate(gate: (data: ActiveChain) => boolean) {
  const { chain } = useNetwork();

  return gate({ activeChain: chain });
}
