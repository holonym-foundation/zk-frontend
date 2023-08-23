import { useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../context/HoloKeyGenSig";
import { holonymAuthMessage, holonymKeyGenMessage } from "../constants";
import { SignatureGateData } from "../types";

export default function useSignatureGate(
  gate: (data: SignatureGateData) => boolean
) {
  const account = useAccount();
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

  useEffect(
    () => {
      if (!(account?.address && account?.connector)) return;
      if (!(holoAuthSig || holoAuthSigIsLoading || holoAuthSigIsSuccess)) {
        signHoloAuthMessage().catch((err) => console.error(err));
      }
      if (
        !(
          holoAuthSigIsLoading ||
          holoKeyGenSig ||
          holoKeyGenSigIsLoading ||
          holoKeyGenSigIsSuccess
        )
      ) {
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
    if (!(account?.address && account?.connector)) return;
    // Check that sigs are from account. If they aren't, re-request them
    if (
      holoAuthSig &&
      ethers.utils.verifyMessage(holonymAuthMessage, holoAuthSig) !==
        account.address
    ) {
      clearHoloAuthSig();
      signHoloAuthMessage().catch((err: any) => console.error(err));
    }
    if (
      holoKeyGenSig &&
      ethers.utils.verifyMessage(holonymKeyGenMessage, holoKeyGenSig) !==
        account.address
    ) {
      clearHoloKeyGenSig();
      signHoloKeyGenMessage().catch((err: any) => console.error(err));
    }
  }, [
    account,
    holoAuthSig,
    holoKeyGenSig,
    clearHoloAuthSig,
    clearHoloKeyGenSig,
    signHoloAuthMessage,
    signHoloKeyGenMessage,
  ]);

  return gate({
    holoAuthSig,
    holoAuthSigDigest,
    holoKeyGenSig,
    holoKeyGenSigDigest,
  });
}
