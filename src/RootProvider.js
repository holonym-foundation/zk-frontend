import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LitAuthSigProvider } from "./context/LitAuthSig";
import { HoloAuthSigProvider } from "./context/HoloAuthSig";
import { HoloKeyGenSigProvider } from "./context/HoloKeyGenSig";
import { Provider as WagmiProvider } from "wagmi";
import { wagmiClient } from "./wagmiClient";
import { Gate } from "./Gate";

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
							<Gate gate={connectWalletGateFn} fallback={connectWalletFallback}>
								<Gate gate={signMessagesGateFn} fallback={signMessagesFallback}>
									{children}
								</Gate>
							</Gate>
						</HoloKeyGenSigProvider>
					</HoloAuthSigProvider>
				</LitAuthSigProvider>
			</WagmiProvider>
		</QueryClientProvider>
	);
}
