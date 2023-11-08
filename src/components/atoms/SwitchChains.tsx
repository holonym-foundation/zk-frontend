import { useSwitchNetwork } from "wagmi";
import { addOptimism, addFantom, addAvalanche } from "../../utils/network";

const SwitchChainButton = ({
  switchNetwork, 
  name 
}: {
  switchNetwork: (() => void) | undefined;
  name: string;
}) => {
  return (
    <div
      className="nav-wallet"
      style={{ backgroundColor: "var(--dark-card-background)" }}
    >
      <div
        className="nav-wallet-text nav-link w-nav-link"
        onClick={() => {
          if (switchNetwork) {
            switchNetwork();
          } else {
            console.error("switchNetwork is undefined");
          }
        }}
      >
        Switch to{" "}{name}
      </div>
    </div>
  )
}

const ErrorAddNetwork = ({
  name,
  addNetwork,
}: {
  name: string;
  addNetwork: () => void;
}) => {
  return (
    <>
      <p style={{ color: "red" }}>
        An error occurred trying to switch chains. Please make sure you have{" "}
        {name} added to your wallet.
      </p>
      <div
        style={{
          width: "100",
          fontSize: "18px",
          marginTop: "20px",
          marginBottom: "30px",
          maxWidth: "400px",
        }}
      >
        <div
          className="nav-wallet"
          style={{ backgroundColor: "var(--dark-card-background)" }}
        >
          <div
            className="nav-wallet-text nav-link w-nav-link"
            onClick={() => addNetwork()}
          >
            Add {name}
          </div>
        </div>
      </div>
    </>
  );
}

const SwitchChains = () => {
  const { 
    error: errorOptimism,
    switchNetwork: switchToOptimism
  } = useSwitchNetwork({
    chainId: process.env.NODE_ENV === "development" ? 420 : 10,
  });

  const { 
    error: errorEthereum,
    switchNetwork: switchToEthereum
  } = useSwitchNetwork({
    chainId: 1,
  });

  const { 
    error: errorFantom,
    switchNetwork: switchToFantom
  } = useSwitchNetwork({
    chainId: 250,
  });

  const { 
    error: errorAvalanche,
    switchNetwork: switchToAvalanche
  } = useSwitchNetwork({
    chainId: 43114,
  });

  return (
    <>
      <div className="x-container w-container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h1>Switch to a supported chain</h1>
          <div
            style={{
              width: "100",
              fontSize: "18px",
              marginTop: "20px",
              marginBottom: "30px",
              maxWidth: "400px",
            }}
          >
            <SwitchChainButton
              switchNetwork={switchToAvalanche}
              name="Avalanche"
            />

            <div className="spacer-medium" />

            <SwitchChainButton
              switchNetwork={switchToFantom}
              name="Fantom"
            />

            <div className="spacer-medium" />

            <SwitchChainButton
              switchNetwork={switchToEthereum}
              name="Ethereum"
            />

            <div className="spacer-medium" />

            <SwitchChainButton
              switchNetwork={switchToOptimism}
              name="Optimism"
            />
          </div>

          {errorOptimism && (
            <ErrorAddNetwork name="Optimism" addNetwork={addOptimism} />
          )}

          {errorFantom && (
            <ErrorAddNetwork name="Fantom" addNetwork={addFantom} />
          )}

          {errorAvalanche && (
            <ErrorAddNetwork name="Avalanche" addNetwork={addAvalanche} />
          )}

         {errorEthereum && (
            <p style={{ color: "red" }}>
              An error occurred trying to switch chains. Please make sure you
              have Ethereum added to your wallet.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default SwitchChains;
