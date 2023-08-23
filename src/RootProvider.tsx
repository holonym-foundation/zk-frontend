import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from 'wagmi'
import wagmiConfig from './wagmiConfig'
import { HoloAuthSigProvider } from "./context/HoloAuthSig";
import { HoloKeyGenSigProvider } from "./context/HoloKeyGenSig";
import { ProofMetadataProvider } from "./context/ProofMetadata";
import { CredsProvider } from "./context/Creds";
import { ProofsProvider } from "./context/Proofs";
import AccountConnectGate from "./gate/AccountConnectGate";
import SignatureGate from "./gate/SignatureGate";
import NetworkGate from "./gate/NetworkGate";
import { desiredChainId } from "./constants";
import { WagmiAccount, ActiveChain, SignatureGateData } from "./types";

export const queryClient = new QueryClient();

const connectWalletGateFn = (data: WagmiAccount) => {
  return !!data?.account?.address && !!data?.account?.connector;
};

const networkGateFn = (data: ActiveChain) => {
  return data?.activeChain?.id === desiredChainId;
};

const signMessagesGateFn = (data: SignatureGateData) => {
  return (
    !!data?.holoAuthSig &&
    !!data?.holoAuthSigDigest &&
    !!data?.holoKeyGenSig &&
    !!data?.holoKeyGenSigDigest
  );
};

export function RootProvider({
  children,
  connectWalletFallback,
  networkGateFallback,
  signMessagesFallback,
}: {
  children: React.ReactNode;
  connectWalletFallback: React.ReactNode;
  networkGateFallback: React.ReactNode;
  signMessagesFallback: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <HoloAuthSigProvider>
          <HoloKeyGenSigProvider>
            <AccountConnectGate
              gate={connectWalletGateFn}
              fallback={connectWalletFallback}
            >
              <NetworkGate gate={networkGateFn} fallback={networkGateFallback}>
                <SignatureGate
                  gate={signMessagesGateFn}
                  fallback={signMessagesFallback}
                >
                  <CredsProvider>
                    <ProofMetadataProvider>
                      <ProofsProvider>{children}</ProofsProvider>
                    </ProofMetadataProvider>
                  </CredsProvider>
                </SignatureGate>
              </NetworkGate>
            </AccountConnectGate>
          </HoloKeyGenSigProvider>
        </HoloAuthSigProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
