import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useNetwork,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { useQuery } from "@tanstack/react-query"
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import RoundedWindow from "./RoundedWindow"
import { Modal } from "./atoms/Modal";
import {
  PRICE_USD,
  paymentRecieverAddress,
} from "../constants";
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
export const PaymentScreen = (props: { 
  currency: Currency, 
  onPaymentSuccess: (data: { chainId?: number, txHash?: string}) => void
  onBack: () => void
}) => {   
  const [diffWallet, setDiffWallet] = useState(false);
  const [showPayWConnected, setShowPayWConnected] = useState(false);

  return <>
      <Modal children={<PayWithDiffWallet {...props} />} visible={diffWallet} setVisible={setDiffWallet} />
      <Modal children={<PayWithConnectedWallet {...props} />} visible={showPayWConnected} setVisible={setShowPayWConnected} />
      <div
        className="x-wrapper small-center"
        style={{ display: "flex", height: "95%", width: "80%", alignItems: "stretch", justifyContent: "stretch", flexDirection: "column", gap: "50px" }}
      >
        <h1>Payment Options</h1>
        <a 
          className="x-button secondary" 
          onClick={(event) => {
            event.preventDefault();
            setShowPayWConnected(true)
          }}
        >
          Continue With This Wallet
        </a>
        <a 
          className="x-button secondary outline" 
          onClick={(event) =>{
            event.preventDefault();
            setDiffWallet(true)
          }}
        >
          Pay From A Burner Wallet
        </a>

      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button 
          className="export-private-info-button" 
          onClick={(event) => {
            event.preventDefault();
            props.onBack();
          }}
        >
          Back
        </button>
      </div>
    </div> 

  </>
}

export const PayWithConnectedWallet = ({
  currency,
  onPaymentSuccess 
}: {
  currency: Currency
  onPaymentSuccess: (data: { chainId?: number, txHash?: string}) => void 
}) => {
  const { chain } = useNetwork();
  const {
    data: costDenominatedInToken,
    isLoading: costIsLoading,
    isError: costIsError,
  } = useQuery(
    ["govIDSBTCostDenominatedInToken", chain?.id],
    async () => {
      if (process.env.NODE_ENV === "development") {
        return "0.0000000000000000001"
      }
      const price = await fetchPrice(currency)
      return PRICE_USD.div(BigNumber(price)).toString()
    },
  )
  const {
    config,
    error,
    isLoading: preparingTx,
    isError: prepareTxIsError,
    isSuccess: txIsPrepared,
  } = usePrepareSendTransaction({
    chainId: chain?.id,
    to: paymentRecieverAddress,
    value: costDenominatedInToken ? parseEther(costDenominatedInToken) : 0n,
  });
  const {
    data: txResult,
    isLoading: txIsLoading,
    isError: txIsError,
    isSuccess: txIsSuccess,
    sendTransaction,
  } = useSendTransaction(config);

  const {
    data: txReceipt,
    isError: errorWaitingForTx,
    isLoading: waitingForTx,
  } = useWaitForTransaction({
    hash: txResult?.hash,
  })

  useEffect(() => {
    if (!txIsSuccess && !txReceipt?.transactionHash) return;
    onPaymentSuccess({
      chainId: chain?.id,
      txHash: txReceipt?.transactionHash,
    })
  }, [txIsSuccess, txReceipt?.transactionHash])

  return (
    <div style={{ textAlign: "center" }}>
      {costIsLoading ? (
        <p>Loading price...</p>
      ) : costIsError ? (
        <p>Failed to fetch price</p>
      ) : (
        <p>
          The mint price for this SBT is <code>{costDenominatedInToken} {currency.symbol}</code>.
        </p>
      )}
      {prepareTxIsError && (
        <p style={{ color: 'red' }}>Failed to prepare transaction</p>
      )}
      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <button
          className="export-private-info-button"
          style={{
            lineHeight: "1",
            fontSize: "16px",
          }}
          disabled={!txIsPrepared}
          onClick={(event) => {
            event.preventDefault();
            try {
              if (!sendTransaction) throw new Error('sendTransaction is not defined');
              sendTransaction();
            } catch (err) {
              console.error(err);
              datadogLogs.logger.error("GovIDPayment error", undefined, err as Error);
              datadogRum.addError(err);
            }
          }}
        >
          {preparingTx || txIsLoading ? 'Loading...' 
          : waitingForTx ? 'Waiting for transaction...' 
          : 'Submit transaction'}
        </button>
      </div>
    </div>
  )
}

const chainOptions = [
  { chainId: 250, name: "Fantom" },
  { chainId: 10, name: "Optimism" },
]
if (process.env.NODE_ENV === "development") {
  chainOptions.push({ chainId: 420, name: "Optimism Goerli" })
}

export const PayWithDiffWallet = (props: { 
  currency: Currency
  onPaymentSuccess: (data: { chainId?: number, txHash?: string}) => void
}) => { 
  const [amountToPay, setAmountToPay] = useState<BigNumber>();
  const [chainId, setChainId] = useState<number>();
  const [txHash, setTxHash] = useState<string>("");

  useEffectOnce(() => {
    const f = async () => { return await fetchPrice(props.currency) }
    f().then(price=>setAmountToPay(PRICE_USD.div(BigNumber(price))))
  })
  return <>
    <h1>How To</h1>
    <br />
    <p>Please send {amountToPay ? amountToPay.toString() : ""} in {props.currency.symbol} to {paymentRecieverAddress}, then copy the transaction hash of the payment here:    </p>
    <input
      type="text"
      className="text-field"
      placeholder="0x..."
      style={{marginBottom: "10px", width: "100%"}}
      value={txHash}
      onChange={(event) => setTxHash(event.target.value)}
    />
    <select
      style={{ marginBottom: '10px', width: '100%', color: '#060612' }}
      value={chainId}
      onChange={(event) => setChainId(Number(event.target.value))}
    >
      {chainOptions.map((chainOption) => (
        <option key={chainOption.chainId} value={chainOption.chainId}>
          {chainOption.name}
        </option>
      ))}
    </select>
    <button
      style={{width: "100%"}} 
      className="x-button secondary" 
      onClick={(event) => {
        event.preventDefault();
        // TODO: If chainId or txHash is invalid, show error.
        if (
          !chainId || !chainOptions.map((item) => item.chainId).includes(chainId) || 
          !txHash || txHash.length !== 66
        ) {
          console.error("Invalid chainId or txHash", { chainId, txHash })
          return;
        }
        props.onPaymentSuccess({
          chainId: chainId,
          txHash: txHash
        })
      }} 
    >
      Done
    </button>
  </>
}

export const PaymentOptions = ({ 
  onSelectOption 
}: { 
  onSelectOption: (fiat: boolean, symbol: "ETH" | "FTM") => void
}) => { 
  return <>
      <div
        className="x-wrapper small-center"
        style={{ display: "flex", height: "95%", width: "80%", alignItems: "stretch", justifyContent: "stretch", flexDirection: "column", gap: "50px" }}
      >
          <h1>Bond & Fee</h1>

      <a className="glowy-green-button" style={{ width: "100%", fontSize: "20px" }} onClick={(event) => {
              event.preventDefault();
              onSelectOption(false, "FTM")
      }}>Pay In FTM</a>
      <a className="glowy-red-button" style={{ width: "100%", fontSize: "20px" }} onClick={(event) => {
              event.preventDefault();
              onSelectOption(false, "ETH")
      }}>Pay In OP ETH</a>
      <a className="x-button-blue greyed-out-button" style={{ width: "100%", fontSize: "20px" }}>Pay In Fiat (coming soon)</a>

  </div> 
  </>
}

export const PaymentPrereqs = () => { 
  const navigate = useNavigate();

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
          <a 
            onClick={(event) => {
              event.preventDefault();
              navigate("/issuance/idgov")
            }}
            className="glowy-green-button"
            style={{ width: "100%", fontSize: "20px" }}
          >
            Continue
          </a>
          <p>This is a privacy-centric service. For more info, see <a href="/privacy" target="_blank">privacy</a></p>
  
    </div> 
    </RoundedWindow>
}