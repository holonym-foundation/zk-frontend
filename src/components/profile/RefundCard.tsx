import { useState } from "react";
import { Modal } from "../atoms/Modal";
import useRequestRefund from "../../hooks/useRequestRefund";
import { IdServerSession } from "../../types";

export default function RefundCard({ 
  failedSessions,
  refetchSessions,
}: { 
  failedSessions?: IdServerSession[],
  refetchSessions: () => void,
}) {
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [refundTo, setRefundTo] = useState<string>("");

  const {
    data: refundTxReceipt,
    isLoading: refundIsLoading,
    isError: refundIsError,
    isSuccess: refundIsSuccess,
    error: refundError,
    mutate: requestRefund,
  } = useRequestRefund();

  const errMsg = (refundError as Error)?.message ?? ''

  return (
    <>
      <Modal
        visible={modalIsVisible}
        setVisible={(visible) => {
          if (!visible) {
            refetchSessions()
          }
          setModalIsVisible(visible)
        }}
        blur={true}
        heavyBlur={true}
      >
        <div style={{ width: "90%" }}>
          {/* Only show "enter wallet address" form if user is getting on-chain refund */}
          {!failedSessions?.[0]?.payPal && (
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
                style={{ marginBottom: "10px", width: "100%" }}
                value={refundTo}
                onChange={(event) => setRefundTo(event.target.value)}
              />
              <button
                style={{ marginBottom: "10px", width: "100%" }}
                className="x-button secondary"
                onClick={(event) => {
                  event.preventDefault();
                  requestRefund({ refundTo, sid: failedSessions?.[0]?._id ?? null })
                }}
                disabled={refundIsLoading}
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
        </div>
      </Modal>
      <div className="profile-info-card">
        <div
          className="card-header"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              className="card-header-title"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Refund Available
            </h2>
            <div style={{ display: "flex", textAlign: "center" }}>
              <p>
                One or more of your government ID verification attempts
                failed. You are eligible for a refund.
              </p>
            </div>
          </div>
        </div>

        <div
          className="card-content"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            className="x-button secondary"
            onClick={() => {
              setModalIsVisible(true)
              if (failedSessions?.[0].payPal) {
                requestRefund({ sid: failedSessions?.[0]?._id ?? null })
                return
              }
            }}
          >
            Claim Refund
          </button>
        </div>
      </div>
    </>
  );
}
