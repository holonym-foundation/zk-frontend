import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HoloAuthSigProvider } from "./context/HoloAuthSig";
import { HoloKeyGenSigProvider } from "./context/HoloKeyGenSig";
import { ProofMetadataProvider } from "./context/ProofMetadata";
import { ProofsProvider } from "./context/Proofs";
import { Provider as WagmiProvider } from "wagmi";
import { wagmiClient } from "./wagmiClient";
import AccountConnectGate from "./gate/AccountConnectGate";
import SignatureGate from "./gate/SignatureGate";

export const queryClient = new QueryClient();

const connectWalletGateFn = (data) => {
	return !!data?.account?.address && !!data?.account?.connector;
};

const signMessagesGateFn = (data) => {
	return !!data?.holoAuthSig && !!data?.holoAuthSigDigest && !!data?.holoKeyGenSig && !!data?.holoKeyGenSigDigest;
};

export function RootProvider({ children, connectWalletFallback, signMessagesFallback }) {
	return (
		<QueryClientProvider client={queryClient}>
			<WagmiProvider client={wagmiClient}>
				<HoloAuthSigProvider>
					<HoloKeyGenSigProvider>
						<AccountConnectGate gate={connectWalletGateFn} fallback={connectWalletFallback}>
							<SignatureGate gate={signMessagesGateFn} fallback={signMessagesFallback}>
								<ProofMetadataProvider>
									<ProofsProvider>
										{children}
									</ProofsProvider>
								</ProofMetadataProvider>
							</SignatureGate>
						</AccountConnectGate>
					</HoloKeyGenSigProvider>
				</HoloAuthSigProvider>
			</WagmiProvider>
		</QueryClientProvider>
	);
}
