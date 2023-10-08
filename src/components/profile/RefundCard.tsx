import { useState } from "react";
import { Modal } from "../atoms/Modal";
import useRequestIDVRefund from "../../hooks/useRequestIDVRefund";
import useRequestPhoneRefund from "../../hooks/useRequestPhoneRefund";
import { IdServerSession, PhoneServerSession } from "../../types";

function RefundModal({
  visible,
  setVisible,
  onSubmit,
  refundResponse,
  refundIsLoading,
  refundIsError,
  errMsg,
}: {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  onSubmit: (refundTo: string) => void,
  refundResponse: any,
  refundIsLoading: boolean,
  refundIsError: boolean,
  errMsg: string,
}) {
  const [refundTo, setRefundTo] = useState<string>("");

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      blur={true}
      heavyBlur={true}
    >
      <div style={{ width: "90%" }}>
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
            onSubmit(refundTo)
          }}
          disabled={refundIsLoading}
        >
          {refundIsLoading ? 'Requesting refund...' : refundResponse ? 'Refund successful' : 'Request refund'}
        </button>

        {refundIsLoading && (
          <p>Refund in progress...</p>
        )}

        {refundIsError && (
          <p style={{ color: "#f00" }}>{errMsg ? errMsg : 'Encountered an error during refund.'}</p>
        )}

        {refundResponse && (
          <>
            <p>
              Your account has been refunded.
            </p>
            {refundResponse?.transactionHash && <p>Transaction hash: {refundResponse?.transactionHash}</p>}
          </>
        )}
      </div>
    </Modal>
  )
}

export default function RefundCard({ 
  failedIdSessions,
  refetchIdSessions,
  failedPhoneSessions,
  refetchPhoneSessions,
}: { 
  failedIdSessions?: IdServerSession[],
  refetchIdSessions: () => void,
  failedPhoneSessions?: PhoneServerSession[],
  refetchPhoneSessions: () => void,
}) {
  const [idModalIsVisible, setIdModalIsVisible] = useState(false);
  const [phoneModalIsVisible, setPhoneModalIsVisible] = useState(false);

  const {
    data: refundIdResponse,
    isLoading: refundIdIsLoading,
    isError: refundIdIsError,
    isSuccess: refundIdIsSuccess,
    error: refundIdError,
    mutate: requestIDVRefund,
  } = useRequestIDVRefund();

  const {
    data: refundPhoneResponse,
    isLoading: refundPhoneIsLoading,
    isError: refundPhoneIsError,
    isSuccess: refundPhoneIsSuccess,
    error: refundPhoneError,
    mutate: requestPhoneRefund,
  } = useRequestPhoneRefund();

  return (
    <>
      {/* Refund modal for IDV refund */}
      <RefundModal 
        visible={idModalIsVisible}
        setVisible={(visible: boolean) => {
          if (!visible) {
            refetchIdSessions()
          }
          setIdModalIsVisible(visible)
        }}
        onSubmit={(refundTo: string) => {
          if (failedIdSessions?.[0]?._id) {
            requestIDVRefund({ refundTo, sid: failedIdSessions?.[0]?._id ?? null })
          } else {
            console.error('No failed IDV sessions found')
          }
        }}
        refundResponse={refundIdResponse}
        refundIsLoading={refundIdIsLoading}
        refundIsError={refundIdIsError}
        errMsg={(refundIdError as Error)?.message ?? ''}
      />

      <RefundModal 
        visible={phoneModalIsVisible}
        setVisible={(visible: boolean) => {
          if (!visible) {
            refetchPhoneSessions()
          }
          setPhoneModalIsVisible(visible)
        }}
        onSubmit={(refundTo: string) => {
          if (failedPhoneSessions?.[0]?.id) {
            requestPhoneRefund({ refundTo, id: failedPhoneSessions?.[0]?.id?.S ?? null })
          } else {
            console.error('No failed sessions found')
          }
        }}
        refundResponse={refundPhoneResponse}
        refundIsLoading={refundPhoneIsLoading}
        refundIsError={refundPhoneIsError}
        errMsg={(refundPhoneError as Error)?.message ?? ''}
      />

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
                One or more of your verification attempts
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
              if (failedIdSessions?.[0]?._id) {
                setIdModalIsVisible(true)
              } else if (failedPhoneSessions?.[0]?.id) {
                setPhoneModalIsVisible(true)
              } else {
                console.error('No failed sessions found')
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
