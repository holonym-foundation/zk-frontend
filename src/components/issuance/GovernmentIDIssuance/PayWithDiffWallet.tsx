import { useState, useEffect } from "react";
import { paymentRecieverAddress } from "../../../constants";
import useFetchIDVCryptoPrice from "../../../hooks/useFetchIDVCryptoPrice";
import { Currency, SupportedChainIdsForIDVPayment } from "../../../types";

const PayWithDiffWallet = (props: {
  currency: Currency;
  onPaymentSuccess: (data: { chainId?: number; txHash?: string }) => void;
  chainId?: SupportedChainIdsForIDVPayment;
}) => {
  const [txHash, setTxHash] = useState<string>("");
  const [showCopied, setShowCopied] = useState(false);
  const [error, setError] = useState<string>();

  const {
    data: costDenominatedInToken,
    isLoading: costIsLoading,
    isError: costIsError,
    isSuccess: costIsSuccess,
  } = useFetchIDVCryptoPrice(props.currency);

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
      <h1>Mint your Holo with Privacy using a Burner Wallet</h1>
      <br />
      <ol style={{ fontSize: "14px", paddingLeft: "20px" }}>
        <li>
          <p>Use your wallet of choice and select your burner account.</p>
        </li>
        <li>
          <p>Make sure your account is funded, from a CEX preferrably to avoid doxxing an existing wallet.</p>
        </li>
        <li>
          <div>
            {costIsSuccess && costDenominatedInToken && (
              <p>
                Send {costDenominatedInToken ? costDenominatedInToken.decimalPlaces(10).toString() : ""} in{" "}
                {props.currency.symbol} to
              </p>
            )}
            {costIsLoading && <p>Loading price...</p>}
            {costIsError && <p style={{ color: "red" }}>Error loading price</p>}

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
          <p style={{ marginTop: "10px" }}>
            Wait for the transaction to complete. Then copy and paste the transaction hash here:
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
          if (!txHash || txHash.length !== 66) {
            console.error("Invalid txHash", { txHash });
            setError("Invalid transaction hash");
            return;
          }
          props.onPaymentSuccess({
            chainId: props.chainId,
            txHash: txHash,
          });
        }}
      >
        Done
      </button>
      {error && (
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "0px" }}>
          <p style={{ color: "red", fontSize: "14px", marginBottom: "0px" }}>
            {error}
          </p>
        </div>
      )}
    </>
  );
};

export default PayWithDiffWallet;
