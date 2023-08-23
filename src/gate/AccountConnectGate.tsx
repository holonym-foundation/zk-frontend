import React from "react";
import { useAccount } from "wagmi";
import { WagmiAccount } from "../types";

export default function AccountConnectGate({
  children,
  fallback,
  gate,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  gate: (data: WagmiAccount) => boolean;
}) {
  const account = useAccount();
  const isGateOpen = gate({ account });
  if (isGateOpen) {
    return <>{children}</>;
  }
  return fallback;
}
