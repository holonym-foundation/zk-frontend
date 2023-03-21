import { useEffect } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import RoundedWindow from "./RoundedWindow";
import ConnectWalletScreen from "./atoms/connect-wallet-screen";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../context/HoloKeyGenSig";
import { holonymAuthMessage, holonymKeyGenMessage } from "../constants";

const SignatureContainer = ({ children }) => {
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

  useEffect(() => {
    if (!(account?.address && account?.connector)) return;
    if (!((holoAuthSig || holoAuthSigIsLoading ) || holoAuthSigIsSuccess)) {
      signHoloAuthMessage().catch(err => console.error(err))
    }
    if (!(((holoAuthSigIsLoading || holoKeyGenSig ) || holoKeyGenSigIsLoading ) || holoKeyGenSigIsSuccess)) {
      signHoloKeyGenMessage().catch(err => console.error(err))
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
  )

  useEffect(() => {
    if (!(account?.address && account?.connector)) return;
    // Check that sigs are from account. If they aren't, re-request them
    if (holoAuthSig && ethers.utils.verifyMessage(holonymAuthMessage, holoAuthSig) !== account.address) {
      console.log('account changed. Re-retrieving holoAuthSig');
      clearHoloAuthSig()
      signHoloAuthMessage().catch(err => console.error(err))
    }
    if (holoKeyGenSig && ethers.utils.verifyMessage(holonymKeyGenMessage, holoKeyGenSig) !== account.address) {
      console.log('account changed. Re-retrieving holoKeyGenSig');
      clearHoloKeyGenSig()
      signHoloKeyGenMessage().catch(err => console.error(err))
    }
  }, [account, holoAuthSig, holoKeyGenSig, clearHoloAuthSig, clearHoloKeyGenSig, signHoloAuthMessage, signHoloKeyGenMessage])
  
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
      {!(account?.address && account?.connector ) ? (
        <RoundedWindow>
          <ConnectWalletScreen />
        </RoundedWindow>
      ) : !(holoAuthSigDigest && holoKeyGenSigDigest ) ? (
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
