import { useNetwork } from "wagmi";
import { desiredChainId } from '../../constants'

const SwitchChains = () => {
  const {
    error,
    switchNetwork,
  } = useNetwork({
    chainId: desiredChainId
  });

  async function addOptimism() {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xa',
          chainName: 'Optimism',
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://mainnet.optimism.io'],
          blockExplorerUrls: ['https://optimistic.etherscan.io']
        }]
      })
    } catch (err) {
      console.error(err)
    }
  }

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
              <div className="nav-wallet-text nav-link w-nav-link" onClick={() => {
                switchNetwork()
              }}>
                Switch Chains
              </div>
            </div>      
          </div>

          {error && (
            <>
              <p style={{ color: 'red' }}>
                An error occurred trying to switch chains. Please make sure you have Optimism
                added to your wallet.
              </p>
              <div style={{ width: "100", fontSize: "18px", marginTop: "20px", marginBottom: "30px", maxWidth: "400px" }}>
                <div className="nav-wallet" style={{ backgroundColor: 'var(--dark-card-background)' }}>
                  <div className="nav-wallet-text nav-link w-nav-link" onClick={() => addOptimism()}>
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
}

export default SwitchChains;
