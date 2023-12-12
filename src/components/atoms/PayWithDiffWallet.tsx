import { useState, useEffect } from "react";
import { BigNumber } from "bignumber.js";
import { paymentRecieverAddress } from "../../constants";
import useHashSid from '../../hooks/useHashSid';
import { Currency, SupportedChainIdsForPayment } from "../../types";

const opChainIds = [10, 420];
const ethChainIds = [1];

const PayWithDiffWallet = ({
  currency,
  onPaymentSuccess,
  chainId,
  costDenominatedInToken,
  costIsLoading,
  costIsError,
  costIsSuccess,
}: {
  currency: Currency;
  onPaymentSuccess: (data: { chainId?: number; txHash?: string }) => void;
  chainId?: SupportedChainIdsForPayment;
  costDenominatedInToken: BigNumber | undefined;
  costIsLoading: boolean;
  costIsError: boolean;
  costIsSuccess: boolean;
}) => {
  const [txHash, setTxHash] = useState<string>("");
  const [showCopiedAddress, setShowCopiedAddress] = useState(false);
  const [showCopiedData, setShowCopiedData] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (showCopiedAddress) {
      const timer = setTimeout(() => {
        setShowCopiedAddress(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCopiedAddress]);

  useEffect(() => {
    if (showCopiedData) {
      const timer = setTimeout(() => {
        setShowCopiedData(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCopiedData]);

  const sidDigest = useHashSid();

  return (
    <>
      <h1>Mint your Holo with Privacy using a Burner Wallet</h1>
      <h2>PROCEED WITH CAUTION</h2>
      <p>
        IMPORTANT: Every field is required. If you submit a transaction with incorrect data,{' '}
        you will not be able to verify. If your wallet does not allow you to modify the <code>data
        </code> field, do not use this option.
      </p>
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
                Create a transaction with the following properties.
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
                <code>
                  <span style={{ color: '#aaa' }}>to:</span> {paymentRecieverAddress}
                </code>
              </p>
              <button
                className="x-button secondary outline"
                onClick={() => {
                  navigator.clipboard.writeText(paymentRecieverAddress);
                  setShowCopiedAddress(true);
                }}
                style={{
                  fontSize: "12px",
                  padding: "5px",
                  // maxWidth: '80px'
                }}
              >
                {showCopiedAddress ? "\u2713 Copied" : "Copy Address"}
              </button>
            </div>

            <br />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                maxWidth: '460px'              
              }}
            >
              <p style={{ marginBottom: "0px", marginRight: "10px" }}>
                <code>
                  <span style={{ color: '#aaa' }}>amount:</span> {costDenominatedInToken ? costDenominatedInToken.decimalPlaces(10).toString() : ""} in{" "}
                  {currency.symbol} {chainId && opChainIds.includes(chainId) && "(on Optimism)"}
                  {chainId && ethChainIds.includes(chainId) && "(on Ethereum mainnet)"}
                </code>
              </p>
            </div>

            <br />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: '460px'
              }}
            >
              <p style={{ 
                marginBottom: "0px", 
                marginRight: "10px", 
                wordWrap: 'break-word', 
                whiteSpace: 'normal',
                maxWidth: '80%'
              }}>
                {sidDigest && (
                  <code style={{ whiteSpace: 'pre-wrap', maxWidth: '100%' }}>
                    <span style={{ color: '#aaa' }}>data:</span> {sidDigest}
                  </code>
                )}
                {!sidDigest && (
                  <code style={{ color: 'red', whiteSpace: 'pre-wrap', maxWidth: '100%' }}>
                    ERROR: Could not load data. Please submit a ticket.
                  </code>
                )}
              </p>
              <button
                className="x-button secondary outline"
                onClick={() => {
                  navigator.clipboard.writeText((sidDigest ?? '') as string);
                  setShowCopiedData(true);
                }}
                style={{
                  fontSize: "12px",
                  padding: "5px",
                }}
              >
                {showCopiedData ? "\u2713 Copied" : "Copy data"}
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
          onPaymentSuccess({
            chainId: chainId,
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
