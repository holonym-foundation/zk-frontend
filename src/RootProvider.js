import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LitAuthSigProvider } from "./context/LitAuthSig";
import { HoloAuthSigProvider } from "./context/HoloAuthSig";
import { HoloKeyGenSigProvider } from "./context/HoloKeyGenSig";
import { Provider as WagmiProvider } from "wagmi";
import { wagmiClient } from "./wagmiClient";
import AccountConnectGate from "./gate/AccountConnectGate";
import SignatureGate from "./gate/SignatureGate";

export const queryClient = new QueryClient();

const connectWalletGateFn = (data) => {
	return !!data?.account?.address && !!data?.account?.connector;
};

const signMessagesGateFn = (data) => {
	return !!data?.litAuthSig && !!data?.holoAuthSig && !!data?.holoAuthSigDigest && !!data?.holoKeyGenSig && !!data?.holoKeyGenSigDigest;
};

export function RootProvider({ children, connectWalletFallback, signMessagesFallback }) {
	return (
		<QueryClientProvider client={queryClient}>
			<WagmiProvider client={wagmiClient}>
				<LitAuthSigProvider>
					<HoloAuthSigProvider>
						<HoloKeyGenSigProvider>
							<AccountConnectGate gate={connectWalletGateFn} fallback={connectWalletFallback}>
								<SignatureGate gate={signMessagesGateFn} fallback={signMessagesFallback}>
									{children}
								</SignatureGate>
							</AccountConnectGate>
						</HoloKeyGenSigProvider>
					</HoloAuthSigProvider>
				</LitAuthSigProvider>
			</WagmiProvider>
		</QueryClientProvider>
	);
}
