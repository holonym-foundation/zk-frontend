import { useSwitchNetwork } from "wagmi";
import { addAvalanche } from "../../utils/network";

const SwitchToAvalanche = () => {
  const { 
    error,
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
          <h1>Please Switch to Avalanche</h1>
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
                  if (switchToAvalanche) {
                    switchToAvalanche();
                  } else {
                    console.error("switchToAvalanche is undefined");
                  }
                }}
              >
                Switch to Avalanche
              </div>
            </div>
          </div>

          {error && (
            <>
              <p style={{ color: "red" }}>
                An error occurred trying to switch chains. Please make sure you
                have Avalanche added to your wallet.
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
                    onClick={() => addAvalanche()}
                  >
                    Add Avalanche
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

export default SwitchToAvalanche;
