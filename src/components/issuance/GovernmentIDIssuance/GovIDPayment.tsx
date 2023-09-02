import { useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  useNetwork,
  usePrepareSendTransaction,
  useSendTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import { idServerUrl, sbtPaymentRecipients } from "../../../constants";
import { chainIdToNativeCurrency, govIDSBTPrices } from "../../../constants/prices";
import useIdServerSessions from "../../../hooks/useIdServerSessions";

const GovIDPayment = ({ onPaymentSuccess }: { onPaymentSuccess: (data: { chainId?: number, txHash?: string}) => void }) => {
  const { chain } = useNetwork();
  const tokenSymbol = useMemo(() => {
    if (!chain?.id) return 'ETH';
    return chainIdToNativeCurrency[
      chain.id as keyof typeof chainIdToNativeCurrency
    ]
  }, [chain?.id])
  const sbtCost = useMemo(() => {
    if (!tokenSymbol) return parseEther("0").toString();
    return govIDSBTPrices[tokenSymbol as keyof typeof govIDSBTPrices].toString()
  }, [tokenSymbol])
  const {
    config,
    error,
    isLoading: preparingTx,
    isSuccess: txIsPrepared,
  } = usePrepareSendTransaction({
    chainId: chain?.id,
    to: sbtPaymentRecipients.idgov,
    value: parseEther(sbtCost),
  });
  const {
    data: txResult,
    isLoading: txIsLoading,
    isError: txIsError,
    isSuccess: txIsSuccess,
    sendTransaction,
  } = useSendTransaction(config);

  // const { data: idServerSessions, isLoading: idServerSessionsIsLoading } =
  //   useIdServerSessions();


  useEffect(() => {
    if (!txIsSuccess) return;
    onPaymentSuccess({
      chainId: chain?.id,
      txHash: txResult?.hash,
    })
  }, [txIsSuccess])
 
  return (
    <div style={{ textAlign: "center" }}>
      <p>
        The mint price for this SBT is <code>{sbtCost} {tokenSymbol}</code>.
      </p>
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
          onClick={() => {
            try {

              // TODO: Remove this branch. This is only for testing.
              if (process.env.NODE_ENV === 'development') {
                console.log('GovIDPayment: calling onPaymentSuccess')
                onPaymentSuccess({
                  chainId: 10,
                  txHash: '0x1234'
                })
                return
              }

              if (!sendTransaction) throw new Error('sendTransaction is not defined');
              sendTransaction();
            } catch (err) {
              console.error(err);
              datadogLogs.logger.error("GovIDPayment error", undefined, err as Error);
              datadogRum.addError(err);
            }
          }}
        >
          {preparingTx ? 'Loading...' : 'Submit transaction'}
        </button>
      </div>
    </div>
  );
};

export default GovIDPayment;
