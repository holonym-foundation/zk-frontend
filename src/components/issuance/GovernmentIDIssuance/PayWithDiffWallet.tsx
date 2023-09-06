import { useState, useEffect } from "react";
import { PRICE_USD, paymentRecieverAddress } from "../../../constants";
import { fetchPrice } from "../../../utils/misc";
import { useEffectOnce } from "usehooks-ts";
import { BigNumber } from "bignumber.js";
import { Currency, SupportedChainIdsForIDVPayment } from "../../../types";

const chainOptions = [
  { chainId: 250, name: "Fantom" },
  { chainId: 10, name: "Optimism" },
];
if (process.env.NODE_ENV === "development") {
  chainOptions.push({ chainId: 420, name: "Optimism Goerli" });
}

const PayWithDiffWallet = (props: {
  currency: Currency;
  onPaymentSuccess: (data: { chainId?: number; txHash?: string }) => void;
  chainId?: SupportedChainIdsForIDVPayment;
}) => {
  const [amountToPay, setAmountToPay] = useState<BigNumber>();
  const [chainId, setChainId] = useState<number>(chainOptions[0].chainId);
  const [txHash, setTxHash] = useState<string>("");
  const [showCopied, setShowCopied] = useState(false);

  useEffectOnce(() => {
    const f = async () => {
      return await fetchPrice(props.currency);
    };
    f().then((price) => setAmountToPay(PRICE_USD.div(BigNumber(price))));
  });

  useEffect(() => {
    if (showCopied) {
      const timer = setTimeout(() => {
        setShowCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCopied]);

  return (
    <>
      <h1>How To</h1>
      <br />
      <ol style={{ fontSize: "14px", paddingLeft: "20px" }}>
        <li>
          <div>
            <p>
              Please send {amountToPay ? amountToPay.toString() : ""} in{" "}
              {props.currency.symbol} to
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p style={{ marginBottom: "0px", marginRight: "10px" }}>
                <code>{paymentRecieverAddress}</code>
              </p>
              <button
                className="x-button secondary outline"
                onClick={() => {
                  navigator.clipboard.writeText(paymentRecieverAddress);
                  setShowCopied(true);
                }}
                style={{
                  fontSize: "12px",
                  padding: "5px",
                }}
              >
                {showCopied ? "\u2713 Copied" : "Copy Address"}
              </button>
            </div>
          </div>
        </li>
        <li>
          <p>Then copy the transaction hash of the payment here:
          </p>
        </li>
      </ol>
      <input
        type="text"
        className="text-field"
        placeholder="0x..."
        style={{ marginBottom: "10px", width: "100%" }}
        value={txHash}
        onChange={(event) => setTxHash(event.target.value)}
      />
      <button
        style={{ width: "100%" }}
        className="x-button secondary"
        onClick={(event) => {
          event.preventDefault();
          // TODO: If chainId or txHash is invalid, show error.
          if (
            !chainId ||
            !chainOptions.map((item) => item.chainId).includes(chainId) ||
            !txHash ||
            txHash.length !== 66
          ) {
            console.error("Invalid chainId or txHash", { chainId, txHash });
            return;
          }
          props.onPaymentSuccess({
            chainId: chainId,
            txHash: txHash,
          });
        }}
      >
        Done
      </button>
    </>
  );
};

export default PayWithDiffWallet;
