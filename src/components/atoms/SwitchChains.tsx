import { useSwitchNetwork } from "wagmi";
import { addOptimism, addFantom } from "../../utils/network";

const SwitchChains = () => {
  const { 
    error: errorOptimism,
    switchNetwork: switchToOptimism
  } = useSwitchNetwork({
    chainId: process.env.NODE_ENV === "development" ? 420 : 10,
  });

  const { 
    error: errorFantom,
    switchNetwork: switchToFantom
  } = useSwitchNetwork({
    chainId: 250,
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
          <h1>Please Switch to Fantom or Optimism</h1>
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
                onClick={() => {
                  if (switchToFantom) {
                    switchToFantom();
                  } else {
                    console.error("switchToFantom is undefined");
                  }
                }}
              >
                Switch to Fantom
              </div>
            </div>

            <div className="spacer-medium" />

            <div
              className="nav-wallet"
              style={{ backgroundColor: "var(--dark-card-background)" }}
            >
              <div
                className="nav-wallet-text nav-link w-nav-link"
                onClick={() => {
                  if (switchToOptimism) {
                    switchToOptimism();
                  } else {
                    console.error("switchToOptimism is undefined");
                  }
                }}
              >
                Switch to Optimism
              </div>
            </div>
          </div>

          {errorOptimism && (
            <>
              <p style={{ color: "red" }}>
                An error occurred trying to switch chains. Please make sure you
                have Optimism added to your wallet.
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
                    onClick={() => addOptimism()}
                  >
                    Add Optimism
                  </div>
                </div>
              </div>
            </>
          )}

          {errorFantom && (
            <>
              <p style={{ color: "red" }}>
                An error occurred trying to switch chains. Please make sure you
                have Fantom added to your wallet.
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
                    onClick={() => addFantom()}
                  >
                    Add Fantom
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SwitchChains;
