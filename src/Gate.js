import React from "react";
import { useGateFn } from "./useGateFn";

export function Gate({ children, fallback, gate }) {
	isGateOpen = useGateFn(gate);
	if (isGateOpen) {
		return <>{children}</>;
	}
	return fallback;
}
