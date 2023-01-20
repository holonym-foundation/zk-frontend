import { useEffect } from "react";
import { useAccount } from "wagmi";
import RoundedWindow from "./RoundedWindow";
import ConnectWalletScreen from "./atoms/connect-wallet-screen";
import { useLitAuthSig } from '../context/LitAuthSig';
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../context/HoloKeyGenSig";

const SignatureContainer = ({ children }) => {
  const { data: account } = useAccount();
  const { 
    litAuthSig, 
    litAuthSigIsError,
    litAuthSigIsLoading,
    litAuthSigIsSuccess,
    signLitAuthMessage 
  } = useLitAuthSig();
  const {
    signHoloAuthMessage,
    holoAuthSigIsError,
    holoAuthSigIsLoading,
    holoAuthSigIsSuccess,
    holoAuthSig,
    holoAuthSigDigest,
  } = useHoloAuthSig();
  const {
    signHoloKeyGenMessage,
    holoKeyGenSigIsError,
    holoKeyGenSigIsLoading,
    holoKeyGenSigIsSuccess,
    holoKeyGenSig,
    holoKeyGenSigDigest,
  } = useHoloKeyGenSig();

  useEffect(() => {
    if (!account?.address || !account?.connector) return;
    if (!litAuthSig && !litAuthSigIsLoading && !litAuthSigIsSuccess) {
      signLitAuthMessage()
    }
    if (!litAuthSigIsLoading && !holoAuthSig && !holoAuthSigIsLoading && !holoAuthSigIsSuccess) {
      signHoloAuthMessage()
    }
    if (!holoAuthSigIsLoading && !litAuthSigIsLoading && !holoKeyGenSig && !holoKeyGenSigIsLoading && !holoKeyGenSigIsSuccess) {
      signHoloKeyGenMessage()
    }
  }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      account,
      litAuthSigIsError,
      litAuthSigIsLoading,
      litAuthSigIsSuccess,
      holoAuthSigIsError,
      holoAuthSigIsLoading,
      holoAuthSigIsSuccess,
      holoKeyGenSigIsError,
      holoKeyGenSigIsLoading,
      holoKeyGenSigIsSuccess,
    ]
  )

  const mainDivStyles = {
    position: "relative",
    paddingTop: "100px",
    width: "100%",
    height: "90%",
    display: "flex",
    alignItems: "center",
    justifyContent: "start",
    flexDirection: "column",
  }

  return (
    <>
      {!account?.address || !account?.connector ? (
        <RoundedWindow>
          <ConnectWalletScreen />
        </RoundedWindow>
      ) : !litAuthSig || !holoAuthSigDigest || !holoKeyGenSigDigest ? (
        <RoundedWindow>
          <div style={mainDivStyles}>
            <h2>Please sign the messages in your wallet.</h2>
          </div>
        </RoundedWindow>
      ) : (
        <>
          {children}
        </>
      )}
    </>
  );
};

export default SignatureContainer;
