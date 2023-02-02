import React from "react";
import { useAccount } from "wagmi";

export default function AccountConnectGate({ children, fallback, gate }) {
	const { data: account } = useAccount();
	const isGateOpen = gate({ account });
	if (isGateOpen) {
		return <>{children}</>;
	}
	return fallback;
}
