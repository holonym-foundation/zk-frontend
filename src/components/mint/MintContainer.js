import { useEffect } from "react";
import { useAccount } from "wagmi";
import "../../vouched-css-customization.css";
import "react-phone-number-input/style.css";
import RoundedWindow from "../RoundedWindow";
import ConnectWalletScreen from "../atoms/connect-wallet-screen";
import Progress from "../atoms/progress-bar";
import { useLitAuthSig } from '../../context/LitAuthSig';
import { useHoloAuthSig } from "../../context/HoloAuthSig";


const MintContainer = ({ steps, currentIdx, children }) => {
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

  useEffect(() => {
    if (!account?.address || !account?.connector) return;
    if (!litAuthSig && !litAuthSigIsLoading && !litAuthSigIsSuccess) {
      signLitAuthMessage()
    }
    if (!litAuthSigIsLoading && !holoAuthSig && !holoAuthSigIsLoading && !holoAuthSigIsSuccess) {
      signHoloAuthMessage()
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
    <RoundedWindow>
      {!account?.address || !account?.connector ? (
        <ConnectWalletScreen />
      ) : !litAuthSig || !holoAuthSigDigest ? (
        <>
          <div style={mainDivStyles}>
            <h2>Please sign the messages in your wallet.</h2>
          </div>
        </>
      ) : (
        <>
          <div className="spacer-medium" />
          <Progress steps={steps} currentIdx={currentIdx} />
          <div style={mainDivStyles}>
            {children}
          </div>
        </>
      )}
    </RoundedWindow>
  );
};

export default MintContainer;
