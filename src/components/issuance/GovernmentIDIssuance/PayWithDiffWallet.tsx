import { useState } from "react";
import { PRICE_USD, paymentRecieverAddress } from "../../../constants";
import { fetchPrice } from "../../../utils/misc";
import { useEffectOnce } from "usehooks-ts";
import { BigNumber } from "bignumber.js";
import { Currency } from "../../../types";

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
}) => {
  const [amountToPay, setAmountToPay] = useState<BigNumber>();
  const [chainId, setChainId] = useState<number>(chainOptions[0].chainId);
  const [txHash, setTxHash] = useState<string>("");

  useEffectOnce(() => {
    const f = async () => {
      return await fetchPrice(props.currency);
    };
    f().then((price) => setAmountToPay(PRICE_USD.div(BigNumber(price))));
  });
  return (
    <>
      <h1>How To</h1>
      <br />
      <p>
        Please send {amountToPay ? amountToPay.toString() : ""} in{" "}
        {props.currency.symbol} to {paymentRecieverAddress}, then copy the
        transaction hash of the payment here:{" "}
      </p>
      <input
        type="text"
        className="text-field"
        placeholder="0x..."
        style={{ marginBottom: "10px", width: "100%" }}
        value={txHash}
        onChange={(event) => setTxHash(event.target.value)}
      />
      <select
        style={{ marginBottom: "10px", width: "100%", color: "#060612" }}
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
