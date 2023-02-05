import React from "react";
import useAccountConnectGate from "./useAccountConnectGate";

export default function AccountConnectGate({ children, fallback, gate }) {
	const isGateOpen = useAccountConnectGate(gate);
	if (isGateOpen) {
		return <>{children}</>;
	}
	return fallback;
}
