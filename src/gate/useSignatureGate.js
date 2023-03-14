import { useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { useAccount as useWagmiAccount } from "wagmi";
import useAccount from "../hooks/useAccount";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../context/HoloKeyGenSig";
import { holonymAuthMessage, holonymKeyGenMessage } from "../constants";

export default function useSignatureGate(gate) {
	const { data: wagmiAccount } = useWagmiAccount();
	const { data: account } = useAccount();
	const {
		signHoloAuthMessage,
		holoAuthSigIsError,
		holoAuthSigIsLoading,
		holoAuthSigIsSuccess,
		holoAuthSig,
		holoAuthSigDigest,
		clearHoloAuthSig,
	} = useHoloAuthSig();
	const {
		signHoloKeyGenMessage,
		holoKeyGenSigIsError,
		holoKeyGenSigIsLoading,
		holoKeyGenSigIsSuccess,
		holoKeyGenSig,
		holoKeyGenSigDigest,
		clearHoloKeyGenSig,
	} = useHoloKeyGenSig();
	const usingWagmi = useMemo(
		() => !!wagmiAccount?.address && !!wagmiAccount?.connector,
		[wagmiAccount]
	);

	useEffect(
		() => {
			if (!account?.address || !account?.connector)
				return;
			if (!holoAuthSig &&
				!holoAuthSigIsLoading &&
				!holoAuthSigIsSuccess) {
				signHoloAuthMessage().catch((err) => console.error(err));
			}
			if (!holoAuthSigIsLoading &&
				!holoKeyGenSig &&
				!holoKeyGenSigIsLoading &&
				!holoKeyGenSigIsSuccess) {
				signHoloKeyGenMessage().catch((err) => console.error(err));
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			account,
			holoAuthSigIsError,
			holoAuthSigIsLoading,
			holoAuthSigIsSuccess,
			holoKeyGenSigIsError,
			holoKeyGenSigIsLoading,
			holoKeyGenSigIsSuccess,
		]
	);

	useEffect(() => {
		if (!account?.address || !account?.connector)
			return;
		// Check that sigs are from account. If they aren't, re-request them
		if (usingWagmi) {
			if (holoAuthSig && ethers.utils.verifyMessage(holonymAuthMessage, holoAuthSig) !== account.address) {
				console.log("account changed. Re-retrieving holoAuthSig");
				clearHoloAuthSig();
				signHoloAuthMessage().catch((err) => console.error(err));
			}
			if (holoKeyGenSig && ethers.utils.verifyMessage(holonymKeyGenMessage, holoKeyGenSig) !== account.address) {
				console.log("account changed. Re-retrieving holoKeyGenSig");
				clearHoloKeyGenSig();
				signHoloKeyGenMessage().catch((err) => console.error(err));
			}
		}
		// If user is using Banana wallet, we assume the signatures need to be re-requested
		else {
			// TODO: Verify the signatures. Figure out which scheme Banana wallet uses
			clearHoloAuthSig();
			clearHoloKeyGenSig();
			signHoloAuthMessage().catch((err) => console.error(err));
			signHoloKeyGenMessage().catch((err) => console.error(err));
		}
	}, [account]);

	return gate({ holoAuthSig, holoAuthSigDigest, holoKeyGenSig, holoKeyGenSigDigest });
}
