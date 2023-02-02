import React from "react";
import useSignatureGate from "./useSignatureGate";

export default function SignatureGate({ children, fallback, gate }) {
	const isGateOpen = useSignatureGate(gate);
	if (isGateOpen) {
		return <>{children}</>;
	}
	return fallback;
}
