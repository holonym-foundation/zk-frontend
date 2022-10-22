import { useState, useEffect } from "react";
import { useConnect, useProvider, useNetwork } from "wagmi";
import { Modal, SimpleModal } from "./atoms/Modal";
import chainParams from "../constants/chainParams.json";
import LogoEthereum from "../img/Ethereum.png";
import LogoGnosis from "../img/Gnosis.png";
import LogoPolygon from "../img/Polygon.png";

const supportedChains = [
  {title: "Gnosis Chain", name:"gnosis", logo: LogoGnosis, price: 2, nativeCurrency : "DAI", disabled: false},
  {title: "Mumbai Testnet", name:"mumbai", logo: LogoPolygon, price: 3, nativeCurrency : "MATIC"},
  // {title: "Görli Testnet", name:"goerli", logo: LogoEthereum, price: 0.1, nativeCurrency : "ETH", disabled: false},
  {title: "Polygon", name:"polygon", logo: LogoPolygon, price: 3, nativeCurrency : "MATIC", disabled: true},
  {title: "Ethereum", name:"ethereum", logo: LogoEthereum, price: 0.1, nativeCurrency : "ETH", disabled: true},
]
// Adds a 
const switchToChain = (desiredChain, provider, switchNetworkFallback) => {
  // First try it with the given provider argument
  try {
    // make sure provider exists and has request method
    // NOTE : may need to put "|| provider.provider.request" in this if statement 
    if(!provider || !provider.request){return}
    provider.request({
            method: "wallet_addEthereumChain",
            params: [chainParams[desiredChain]]
          }
  )
  } catch (err) {
    // Otherwise, try it with wagmi
    try {
      switchNetworkFallback(
        parseInt(chainParams[desiredChain].chainId)
      )
    } catch (switchNetworkError) {
      // If both times resulted in an error, could not successfully switch chains
      throw new Error(`could not switch to ${desiredChain} chain. Please manually switch to ${desiredChain}`);
    }
  }
  
}
// Hook for setting a global desired chain and adding/switching to the chain whenever it is changed
export const useDesiredChain = () => {
  const [desiredChain, setDesiredChain] = useState(null);
  const [desiredChainActive, setDesiredChainActive] = useState(false);
  // const provider = useProvider(); //couldn't get this to work easily
  const provider = window.ethereum
  const { connect, connectors, error, isConnecting, pendingConnector } = useConnect();
  const {
    activeChain,
    chains,
    isLoading,
    pendingChainId,
    switchNetwork,
  } = useNetwork();
  // useEffect(()=>setDesiredChain(desiredChain), [desiredChain])
  useEffect(() => {
    // Is desired chain already active?
    if(!isLoading && chainParams[desiredChain] && activeChain?.id === parseInt(chainParams[desiredChain].chainId)){
      setDesiredChainActive(true)
    } else {
      switchToChain(desiredChain, provider, switchNetwork);
    }
  }, [desiredChain, activeChain, isLoading, provider, switchNetwork]);
  
  return {desiredChain:desiredChain, setDesiredChain:setDesiredChain, desiredChainActive:desiredChainActive, desiredChainId:chainParams[desiredChain]?.chainId};
}

export const ChainSwitcher = (props) => {
  const [clickedActiveChain, setClickedActiveChain] = useState(false);
  const { desiredChain, setDesiredChain } = useDesiredChain();
  const {
    activeChain,
    isLoading,
  } = useNetwork();
  useEffect(()=>{if(desiredChain||clickedActiveChain) props.onChainChange(desiredChain)}, [activeChain, clickedActiveChain])

  return (
  <div style={{fontSize : "14px", overflow: "scroll"}}>
    <div className="x-container product w-container" style={{paddingTop: "0px"}} >
      <div className="x-pre-wrapper">
        <h1 className="h1">Select Chain</h1>
        <p className="p-big">Choose a chain to verify your accounts on</p>
      </div>
      <div className="spacer-medium"></div>
      <div className="x-wrapper grid benefits">
        {
          supportedChains.map(chain => (
            <a onClick={()=>{
              if(!chain.disabled) setDesiredChain(chain.name)
              if(chainParams[chain.name] && activeChain?.id) setClickedActiveChain(true)
            }} className={`x-card blue-yellow w-inline-block ${chain.disabled && "disable"}`}>
              <img src={chain.logo} loading="lazy" alt="" className="card-img small" />
              <h2 className="h2-small">{chain.title}</h2>
              <div className="text-link">Cost estimate: {chain.price} <strong>{chain.nativeCurrency}</strong></div>
              {chain.disabled && <><div className="chain-coming-soon"></div>
              <div className="blur-text-overlay">
                <h3 className="blur-text-heading">Coming Soon</h3>
              </div></>}
            </a>
          ))
          }
      </div>
    </div>
  </div>
  )
}

export const ChainSwitcherModal = (props) => {
  return (
      <SimpleModal visible={props.visible} setVisible={props.setVisible} blur={true}>
            <ChainSwitcher onChainChange={props.onChainChange} />  
      </SimpleModal>
  )
}

/* /* {chains.map((x) => (
        <button
          disabled={!switchNetwork || x.id === activeChain?.id}
          key={x.id}
          onClick={() => switchNetwork?.(280)}
        >
          {x.name}
          {isLoading && pendingChainId === x.id && ' (switching)'}
        </button>
      ))} */
      
  
    // try {
    //   switchNetwork?.(desiredChain.chainId)
    // } catch(err) {
    //   console.log(err)
    // }
    
  // if(! (activeChain?.id === parseInt(chainParams[desiredChain].chainId))){
  //   myHoloPage = <h1>Switching to {desiredChain}...</h1>
  // } */}