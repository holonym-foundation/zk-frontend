import React from "react";
import { useAccount } from "wagmi";
// import useAccountConnectGate from "./useAccountConnectGate";

export default function AccountConnectGate({ children, fallback, gate }) {
	// const isGateOpen = useAccountConnectGate(gate);
	const { data: account } = useAccount();
	const isGateOpen = gate({ account });
	if (isGateOpen) {
		return <>{children}</>;
	}
	return fallback;
}
