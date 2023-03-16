import React from "react";
import { useConnect } from "wagmi";
import { Modal } from "./Modal.js";
import metamaskLogo from "../../img/metamask.svg";
import coinbaseLogo from "../../img/coinbaseWallet.svg";
import walletconnectLogo from "../../img/walletConnect.svg";

const walletMetadata = {
  walletConnect : {
    name: 'Wallet Connect',
    description: 'Other mobile and desktop wallets',
    logo: walletconnectLogo,
  },
  metaMask : {
    name: 'MetaMask',
    description: 'The most popular wallet',
    logo: metamaskLogo,
  },
  coinbaseWallet : {
    name: 'Coinbase',
    description: 'Coinbase Wallet (mobile or desktop)',
    logo: coinbaseLogo,
  },
  injected : {
    name: 'Injected',
    description: 'E.g., Brave Wallet or other browser wallets',
    logo: null,
  }, 
}

const WalletModal = (props) => {
  const { connect, connectors, error, isConnecting, pendingConnector } = useConnect();
  return (
    <Modal visible={props.visible} setVisible={props.setVisible} blur={props.blur} heavyBlur={true} transparentBackground={true}>
      {/* <div className="x-card blue"> */}
      <div className="x-wrapper small-center" style={{ padding: "0px", minWidth: "285px", maxWidth: "400px"  }}>
        <h2 className="h2-small">Select Wallet</h2>
        <p className="p-2 white">Connect to the site below with one of our available wallet providers.</p>
          {connectors.sort((a, b) => a.id === "injected" ? 1 : b.id === "injected" ? -1 : 0).map((connector) => {
            if(!connector.ready){return null}
            // console.log(connector.id)
            return (
              <WalletOption 
                connector={connector}
                connect={connect}
                setVisible={props.setVisible}
                logo={walletMetadata[connector.id].logo} 
                name={walletMetadata[connector.id].name}
                description={walletMetadata[connector.id].description}
              />
            )}
          )}

        {error && <p>{error.message}</p>}
      </div>
    </Modal>
  )
}
const WalletOption = ({ connector, connect, setVisible, logo, name, description }) =>  (
  <div key={connector.id} >
    <div
      onClick={() => {connect(connector); setVisible(false)}}
    >
      <div className="x-card">
        <a style={{ textDecoration: "none" }}>
          <div className="id-card profile" style={{maxWidth: "100%"}}>
            <div className="id-card-1">
              <img src={logo} loading="lazy" alt="" className="id-img" style={{height:"69px", width:"69px", maxWidth:"200%",marginRight:"30px"}} />
            </div>
            <div className="id-card-2">
              <div className="id-profile-name-div">
                <h3 className="h3 no-margin">
                  {name}
                </h3>
              </div>
              <div className="spacer-xx-small" />
              <p className="id-designation">{description}</p>
            </div>
          </div>
        </a>
      </div>
    </div>
    <div className="spacer-small" />
  </div>
)
export default WalletModal
