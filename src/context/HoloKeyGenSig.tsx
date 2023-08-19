/**
 * Simple provider component & hook to store the Holo KeyGen sig (and sigDigest) in
 * context so that it doesn't have to be passed as props to every component
 */
import React, { createContext, useContext, useMemo } from "react";
import { useSignMessage } from "wagmi";
import { useLocalStorage } from "usehooks-ts";
import { sha256 } from "../utils/secrets";
import { holonymKeyGenMessage } from "../constants";
import { HoloKeyGenSigContextType } from "../types";

const HoloKeyGenSigContext = createContext<HoloKeyGenSigContextType>({
  signHoloKeyGenMessage: () => Promise.resolve(),
  holoKeyGenSigIsError: false,
  holoKeyGenSigIsLoading: false,
  holoKeyGenSigIsSuccess: false,
  holoKeyGenSig: "",
  holoKeyGenSigDigest: "",
  clearHoloKeyGenSig: () => {},
});

function HoloKeyGenSigProvider({ children }: { children: React.ReactNode }) {
  const [holoKeyGenSig, setHoloKeyGenSig] = useLocalStorage(
    "holoKeyGenSig",
    ""
  );
  const [holoKeyGenSigDigest, setHoloKeyGenSigDigest] = useLocalStorage(
    "holoKeyGenSigDigest",
    ""
  );
  // Using useLocalStorage on strings results in double quotes being added to the ends of the strings
  const parsedHoloKeyGenSig = useMemo(
    () => holoKeyGenSig?.replaceAll('"', ""),
    [holoKeyGenSig]
  );
  const parsedHoloKeyGenSigDigest = useMemo(
    () => holoKeyGenSigDigest?.replaceAll('"', ""),
    [holoKeyGenSigDigest]
  );
  const {
    // data: signedKeyGenMessage,
    isError: holoKeyGenSigIsError,
    isLoading: holoKeyGenSigIsLoading,
    isSuccess: holoKeyGenSigIsSuccess,
    signMessageAsync,
  } = useSignMessage({ message: holonymKeyGenMessage });

  async function signHoloKeyGenMessage() {
    const signedMessage = await signMessageAsync();
    setHoloKeyGenSig(signedMessage);
    const digest = await sha256(signedMessage);
    setHoloKeyGenSigDigest(digest);
  }

  function clearHoloKeyGenSig() {
    setHoloKeyGenSig("");
    setHoloKeyGenSigDigest("");
  }

  return (
    <HoloKeyGenSigContext.Provider
      value={{
        signHoloKeyGenMessage,
        holoKeyGenSigIsError,
        holoKeyGenSigIsLoading,
        holoKeyGenSigIsSuccess,
        holoKeyGenSig: parsedHoloKeyGenSig,
        holoKeyGenSigDigest: parsedHoloKeyGenSigDigest,
        clearHoloKeyGenSig,
      }}
    >
      {children}
    </HoloKeyGenSigContext.Provider>
  );
}

// Helper hook to access the provider values
const useHoloKeyGenSig = () => useContext(HoloKeyGenSigContext);

export { HoloKeyGenSigProvider, useHoloKeyGenSig };
