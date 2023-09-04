import { useSwitchNetwork } from "wagmi";
import { addOptimism } from "../../utils/network";

const SwitchToOptimism = () => {
  const { 
    error: errorOptimism,
    switchNetwork
  } = useSwitchNetwork({
    chainId: process.env.NODE_ENV === "development" ? 420 : 10,
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
          <h1>Please Switch to Optimism</h1>
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
                  if (switchNetwork) {
                    switchNetwork();
                  } else {
                    console.error("switchNetwork is undefined");
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
        </div>
      </div>
    </>
  );
};

export default SwitchToOptimism;
