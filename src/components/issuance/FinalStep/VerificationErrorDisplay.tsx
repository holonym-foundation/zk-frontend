import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MINT_USD } from "../../../constants";
import useRequestIDVRefund from "../../../hooks/useRequestIDVRefund";

const VerificationErrorDisplay = () => {
  const [searchParams] = useSearchParams();
  const [refundTo, setRefundTo] = useState<string>("");
  const [toInputIsVisible, setToInputIsVisible] = useState(false);

  const {
    data: refundTxReceipt,
    isLoading: refundIsLoading,
    isError: refundIsError,
    error: refundError,
    mutate: requestRefund
  } = useRequestIDVRefund()

  const refundBtnsDisabled = refundIsLoading || refundTxReceipt
  const errMsg = (refundError as Error)?.message ?? ''

  return (
    <>
      <h1>Verification failed</h1>
      <p>You can either</p>
      <ul style={{ fontSize: "small", fontFamily: "Montserrat, sans-serif", }}>
        <li>
          <a
            href="https://discord.gg/Sqb6egVwuH"
            target="_blank"
            rel="noreferrer"
            className="in-text-link"
          >
            Open a ticket in the #support-tickets channel in the Holonym Discord with a description of the error.
          </a>
        </li>
        <p style={{ margin: "10px" }}>OR</p>
        <li>
          <button
            onClick={() => setToInputIsVisible(true)}
            className="in-text-link"
            style={{
              background: "none",
              paddingLeft: "0px",
            }}
            disabled={refundBtnsDisabled}
          >
            Get a refund for the mint price (${MINT_USD.toString()}).
          </button>
        </li>
      </ul>

      {/* TODO: Maybe make a refund-and-try-different-provider page? */}
      {/* <TryDifferentIDVProvider /> */}

      {toInputIsVisible && (
        <>
          <label
            htmlFor="refund-to"
            style={{ marginTop: "10px", marginBottom: "10px" }}
          >
            <h1>Enter your wallet address</h1>
          </label>
          <input
            type="text"
            id="refund-to"
            className="text-field"
            placeholder="0x..."
            style={{ marginBottom: "10px", width: "500px" }}
            value={refundTo}
            onChange={(event) => setRefundTo(event.target.value)}
          />
          <button
            style={{ marginBottom: "10px" }}
            className="x-button secondary"
            onClick={(event) => {
              event.preventDefault();
              requestRefund({ refundTo, sid: searchParams.get("sid") })
            }}
            disabled={refundBtnsDisabled}
          >
            {refundIsLoading ? 'Requesting refund...' : refundTxReceipt ? 'Refund successful' : 'Request refund'}
          </button>
        </>
      )}

      {refundIsLoading && (
        <p>Refund in progress...</p>
      )}

      {refundIsError && (
        <p style={{ color: "#f00" }}>{errMsg ? errMsg : 'Encountered an error during refund.'}</p>
      )}

      {refundTxReceipt && (
        <>
          <p>
            Your account has been refunded.
          </p>
          {refundTxReceipt?.transactionHash && <p>Transaction hash: {refundTxReceipt?.transactionHash}</p>}
        </>
      )}
    </>
  );
};

export default VerificationErrorDisplay;
