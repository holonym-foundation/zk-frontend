import React from "react";
import useNetworkGate from "./useNetworkGate";

export default function NetworkGate({ children, fallback, gate }) {
	const isGateOpen = useNetworkGate(gate);
	if (isGateOpen) {
		return <>{children}</>;
	}
	return fallback;
}
