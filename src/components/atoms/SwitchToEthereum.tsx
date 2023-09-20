import { useSwitchNetwork } from "wagmi";

const SwitchToEthereum = () => {
  const { 
    error,
    switchNetwork: switchToEthereum
  } = useSwitchNetwork({
    chainId: 1,
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
          <h1>Please Switch to Ethereum</h1>
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
                  if (switchToEthereum) {
                    switchToEthereum();
                  } else {
                    console.error("switchToEthereum is undefined");
                  }
                }}
              >
                Switch to Ethereum
              </div>
            </div>
          </div>

         {error && (
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

export default SwitchToEthereum;
