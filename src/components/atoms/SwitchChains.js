import { useNetwork } from "wagmi";
import { desiredChainId } from '../../constants'

const SwitchChains = () => {
  const {
    switchNetwork,
  } = useNetwork({
    chainId: desiredChainId
  });

  return (
    <>
      <div className="x-container w-container">
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
        }}>
          <h1>Please Switch to Optimism</h1>
          <div style={{ width: "100", fontSize: "18px", marginTop: "20px", marginBottom: "30px", maxWidth: "400px" }}>
            <div className="nav-wallet" style={{ backgroundColor: 'var(--dark-card-background)' }}>
              <div className="nav-wallet-text nav-link w-nav-link" onClick={() => switchNetwork()}>
                Switch Chains
              </div>
            </div>       
          </div>
        </div>
      </div>
    </>
  );
}

export default SwitchChains;
