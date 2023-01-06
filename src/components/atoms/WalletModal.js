import React from "react";
import { useConnect } from "wagmi";
import { Modal } from "./Modal.js";
import metamaskLogo from "../../img/metamask.svg";
import coinbaseLogo from "../../img/coinbaseWallet.svg";
import walletconnectLogo from "../../img/walletConnect.svg";

const walletMetadata = {
  walletConnect : {
    name: 'Other',
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
    name: 'Default',
    description: 'Your default wallet (already connected, click to confirm)',
    logo: null,
  },
  
} 
const WalletModal = (props) => {
  const { connect, connectors, error, isConnecting, pendingConnector } = useConnect();
  return (
    <Modal visible={props.visible} setVisible={props.setVisible} blur={props.blur}>
      {/* <div className="x-card blue"> */}
      <div className="x-wrapper small-center" style={{ padding: "0px", minWidth: "285px", maxWidth: "400px"  }}>
        <h2 className="h2-small">Select Wallet</h2>
        <p className="p-2 white">Connect to the site below with one of our available wallet providers.</p>
          {connectors.map((connector) => {
            if(!connector.ready){return null}
            // console.log(connector.id)
            return (
              <div key={connector.id} >
                <div
                  onClick={() => {connect(connector); props.setVisible(false)}}
                >
                  <WalletOption 
                    logo={walletMetadata[connector.id].logo} 
                    name={walletMetadata[connector.id].name}
                    description={walletMetadata[connector.id].description}
                    />
                    {/* {isConnecting &&
                      connector.id === pendingConnector?.id &&
                      ' (connecting)'} */}
                </div>
                <div className="spacer-small" />
              </div>
            )})}

        {error && <p>{error.message}</p>}
      </div>
    </Modal>
  )
}
const WalletOption = (props) =>  (
  <div className="x-card">
    <a style={{ textDecoration: "none" }}>
      <div className="id-card profile" style={{maxWidth: "100%"}}>
        <div className="id-card-1">
          <img src={props.logo} loading="lazy" alt="" className="id-img" style={{height:"69px", width:"69px", maxWidth:"200%",marginRight:"30px"}} />
        </div>
        <div className="id-card-2">
          <div className="id-profile-name-div">
            <h3 className="h3 no-margin">
              {props.name}
            </h3>
          </div>
          <div className="spacer-xx-small"></div>
          <p className="id-designation">{props.description}</p>
        </div>
      </div>
    </a>
  </div>
)
export default WalletModal
