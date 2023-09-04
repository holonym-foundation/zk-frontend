import { useNavigate } from "react-router-dom";
import RoundedWindow from "./RoundedWindow"
import { Modal } from "./atoms/Modal";
import { useEffect, useState } from "react";
import { PRICE_USD, paymentRecieverAddress } from "../constants";
import { useEffectOnce } from "usehooks-ts";
import { BigNumber } from "bignumber.js";

type Currency = {
  name: string,
  coinGeckoName: string,
  symbol: string,
}
const fetchPrice = async (c: Currency) => {
  const priceData = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${c.coinGeckoName}&vs_currencies=USD`)
  if (priceData.status !== 200) {
    throw new Error("Failed to fetch price")
  } else {
    return (await priceData.json())[c.coinGeckoName].usd
  }
  
}
export const PaymentScreen = (props: { currency: Currency }) => {   
  const [diffWallet, setDiffWallet] = useState(true);


  return <RoundedWindow>
      <Modal children={<PayWithDiffWallet {...props} />} visible={diffWallet} setVisible={setDiffWallet} />
      <div
        className="x-wrapper small-center"
        style={{ display: "flex", height: "95%", width: "80%", alignItems: "stretch", justifyContent: "stretch", flexDirection: "column", gap: "50px" }}
      >
        <h1>Payment Options</h1>
        <a className="x-button secondary">Continue With This Wallet</a>
        <a className="x-button secondary outline" onClick={()=>setDiffWallet(true)}>Pay From A Burner Wallet</a>

  </div> 

  </RoundedWindow>
}

export const PayWithDiffWallet = (props: { currency: Currency }) => { 
  const [amountToPay, setAmountToPay] = useState<BigNumber>();
  const navigate = useNavigate();

  useEffectOnce(() => {
    const f = async () => { return await fetchPrice(props.currency) }
    f().then(price=>setAmountToPay(PRICE_USD.div(BigNumber(price))))
  })
  return <>
    <h1>How To</h1>
    <br />
    <p>Please send {amountToPay ? amountToPay.toString() : ""} in {props.currency.symbol} to {paymentRecieverAddress}, then copy the transaction hash of the payment here:    </p>
    <input type="text" className="text-field" placeholder="0x..." style={{marginBottom: "10px", width: "100%"}} />
    <button style={{width: "100%"}} className="x-button secondary" onClick={()=>{} /*TODO*/} >Done</button>
  </>
}

export const PaymentOptions = () => { 
  const navigate = useNavigate();
  return <RoundedWindow>
      <div
        className="x-wrapper small-center"
        style={{ display: "flex", height: "95%", width: "80%", alignItems: "stretch", justifyContent: "stretch", flexDirection: "column", gap: "50px" }}
      >
          <h1>Bond & Fee</h1>

      <a className="glowy-green-button" style={{ width: "100%", fontSize: "20px" }} onClick={(event) => {
              event.preventDefault();
              navigate("/pay/ftm");
      }}>Pay In FTM</a>
      <a className="glowy-red-button" style={{ width: "100%", fontSize: "20px" }} onClick={(event) => {
              event.preventDefault();
              navigate("/pay/opeth");
      }}>Pay In OP ETH</a>
      <a className="x-button-blue greyed-out-button" style={{ width: "100%", fontSize: "20px" }}>Pay In Fiat (coming soon)</a>

  </div> 
  </RoundedWindow>
}

export const PaymentPrereqs = () => { 
    return <RoundedWindow>
       <div
          className="x-wrapper small-center"
          style={{ display: "flex", height: "95%", width: "80%", alignItems: "stretch", justifyContent: "stretch", flexDirection: "column", gap: "50px" }}
        >
  
          <h1>Before we proceed, make sure you have:</h1>
         
          <div
            className="checklist"
          >
            <ol>
              <li>Protocol bond <code style={{color: "var(--holo-light-blue)"}}>($2.47)</code> and zkNFT minting fee <code style={{color: "var(--holo-light-blue)"}}>($10)</code>. Crypto or Fiat accepted.</li>
              <li>Government ID on-hand</li>
            </ol>
          </div>
          <p>The zkSBT minting fee will be refunded if ID verification is unsuccessful</p>
          {/* <p>This is a privacy-preserving KYC service. We do not store your data beyond the most minimal necessary. We do not sell your data. All sensitive data is protected by zero-knowledge proofs. For more information on how we protect your privacy, see our <a href="/privacy" target="_blank">privacy page</a> or <a href="https://docs.holonym.id/" target="_blank">docs</a>.</p> */}
          <a href="/issuance/idgov" className="glowy-green-button" style={{ width: "100%", fontSize: "20px" }}>Continue</a>
          <p>This is a privacy-centric service. For more info, see <a href="/privacy" target="_blank">privacy</a></p>
  
    </div> 
    </RoundedWindow>
}