import React from "react";
import useNetworkGate from "./useNetworkGate";
import { ActiveChain } from "../types";

export default function NetworkGate({
  children,
  fallback,
  gate,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  gate: (data: ActiveChain) => boolean;
}) {
  const isGateOpen = useNetworkGate(gate);
  if (isGateOpen) {
    return <>{children}</>;
  }
  return fallback;
}
