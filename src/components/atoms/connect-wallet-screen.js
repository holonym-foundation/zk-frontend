import { useState } from "react";
import UserImage from '../../img/User.svg';
import WalletModal from "./WalletModal";

const ConnectWalletScreen = () => {
  const [walletModalShowing, setWalletModalShowing] = useState(false);

  return (
    <>
      <WalletModal
        visible={walletModalShowing}
        setVisible={setWalletModalShowing}
        blur={true}
      />
      <div className="x-container w-container">
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
        }}>
          <h1>Please Connect Your Wallet First</h1>
          <div style={{ width: "100", fontSize: "18px", marginTop: "20px", marginBottom: "30px", maxWidth: "400px" }}>
            <div className="nav-wallet" style={{ backgroundColor: 'var(--dark-card-background)' }}>
              <img src={UserImage} loading="lazy" alt="" className="nav-wallet-img" />
              <div className="nav-wallet-text nav-link w-nav-link" onClick={() => setWalletModalShowing(true)}>
                Connect wallet
              </div>
            </div>       
          </div>
          <p>If you don't have one, please download a wallet, such as <a href="https://metamask.io/" target="_blank" rel="noreferrer">Metamask</a> or <a href="https://www.coinbase.com/wallet" target="_blank" rel="noreferrer">Coinbase Wallet</a>.</p>
        </div>
      </div>
    </>
  );
}

export default ConnectWalletScreen;
