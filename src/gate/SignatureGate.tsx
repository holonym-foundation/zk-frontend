import React from "react";
import useSignatureGate from "./useSignatureGate";
import { SignatureGateData } from "../types";

export default function SignatureGate({
  children,
  fallback,
  gate,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  gate: (data: SignatureGateData) => boolean;
}) {
  const isGateOpen = useSignatureGate(gate);
  if (isGateOpen) {
    return <>{children}</>;
  }
  return fallback;
}
