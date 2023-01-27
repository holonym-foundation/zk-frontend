import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { LitAuthSigProvider } from "./context/LitAuthSig";
import { HoloAuthSigProvider } from "./context/HoloAuthSig";
import { HoloKeyGenSigProvider } from "./context/HoloKeyGenSig";
import { Provider as WagmiProvider } from "wagmi";
import { wagmiClient } from "./wagmiClient";
import { Gate } from "./Gate";

export const queryClient = new QueryClient();

const gateFn = (data) => {
	return !!data;
};

export function RootProvider({ children, fallback }) {
	return (
		<QueryClientProvider client={queryClient}>
			<WagmiProvider client={wagmiClient}>
				<LitAuthSigProvider>
					<HoloAuthSigProvider>
						<HoloKeyGenSigProvider>
							<Gate gate={gateFn} fallback={fallback}>
								{children}
							</Gate>
						</HoloKeyGenSigProvider>
					</HoloAuthSigProvider>
				</LitAuthSigProvider>
			</WagmiProvider>
		</QueryClientProvider>
	);
}
