import { useSearchParams } from "react-router-dom";
import { useMutation } from '@tanstack/react-query'
import { MINT_USD, idServerUrl } from "../../../constants";

const RefundIDV = ({ retrieveCredsError }: { retrieveCredsError?: string }) => {
  const [searchParams] = useSearchParams();

  const {
    data: refundTxReceipt,
    isLoading: refundIsLoading,
    isError: refundIsError,
    mutate: requestRefund
  } = useMutation(
    async () => {
      const sid = searchParams.get('sid')
      const resp = await fetch(`${idServerUrl}/sessions/${sid}/idv-session/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      const data = await resp.json()
      if (resp.status !== 200) throw new Error(`Error requesting refund: ${data.error}`)
      return data
    }
  )

  return (
    <>
      {retrieveCredsError && (window?.location?.pathname ?? "").includes("issuance/idgov") && (
        <>
          <h1>Verification failed</h1>
          <p>You can either</p>
          <ul style={{ fontSize: "small", fontFamily: "Montserrat, sans-serif", }}>
            <li>
              <a
                href="https://discord.gg/2CFwcPW3Bh"
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
                onClick={() => requestRefund()}
                className="in-text-link"
                style={{
                  background: "none",
                  paddingLeft: "0px",
                }}
                disabled={!refundIsLoading && !refundIsError && !refundTxReceipt}
              >
                Get a refund for the mint price (${MINT_USD.toString()}).
              </button>
            </li>
          </ul>

          {/* TODO: Maybe make a refund-and-try-different-provider page? */}
          {/* <TryDifferentIDVProvider /> */}

          {refundIsLoading && (
            <p>Refund in progress...</p>
          )}

          {refundIsError && (
            <p style={{ color: "#f00" }}>Encountered an error during refund.</p>
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
      )}

      {retrieveCredsError && !(window?.location?.pathname ?? "").includes("issuance/idgov") && (
        <p>
          Please open a ticket in the{" "}
          <a
            href="https://discord.gg/2CFwcPW3Bh"
            target="_blank"
            rel="noreferrer"
            className="in-text-link"
          >
            #support-tickets
          </a>{" "}
          channel in the Holonym Discord with a description of the error.
        </p>
      )}
    </>
  );
};

export default RefundIDV;
