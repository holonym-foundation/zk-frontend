import { useEffect, useMemo } from "react";
import { BigNumber } from 'bignumber.js';
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import { parseEther } from "viem";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import NetworkGate from "../../../gate/NetworkGate";
import SwitchToEthereum from "../../atoms/SwitchToEthereum";
import SwitchToFantom from "../../atoms/SwitchToFantom";
import SwitchToOptimism from "../../atoms/SwitchToOptimism";
import SwitchToAvalanche from "../../atoms/SwitchToAvalanche";
import Loading from "../../atoms/Loading";
import {
  paymentRecieverAddress
} from "../../../constants";
import { calculateIDVPrice } from '../../../utils/misc'
import useFetchCryptoPrices from "../../../hooks/useFetchCryptoPrices";
import { Currency, SupportedChainIdsForPayment, ActiveChain } from "../../../types";

const chainIdToNetworkGateFallback = {
  1: <SwitchToEthereum />,
  250: <SwitchToFantom />,
  10: <SwitchToOptimism />,
  420: <SwitchToOptimism />,
  43114: <SwitchToAvalanche />
}

const PayWithConnectedWallet = ({
  currency,
  chainId,
  onPaymentSuccess,
}: {
  currency: Currency;
  chainId?: SupportedChainIdsForPayment;
  onPaymentSuccess: (data: { chainId?: number; txHash?: string }) => void;
}) => {
  const {
    data: prices,
    isLoading: costIsLoading,
    isError: costIsError,
    isSuccess: costIsSuccess,
  } = useFetchCryptoPrices([currency]);

  const costDenominatedInToken = useMemo(() => {
    const price = prices?.[currency.name.toLowerCase()];
    if (price === undefined) return BigNumber(0);
    return calculateIDVPrice(price);
  }, [prices])

  const {
    config,
    error: prepareTxError,
    isLoading: preparingTx,
    isError: prepareTxIsError,
    isSuccess: txIsPrepared,
  } = usePrepareSendTransaction({
    chainId: chainId,
    to: paymentRecieverAddress,
    value: costDenominatedInToken ? parseEther(costDenominatedInToken.toString()) : 0n,
  });

  const {
    data: txResult,
    error: txError,
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
  });

  useEffect(() => {
    if (!txIsSuccess || !txReceipt?.transactionHash) return;
    onPaymentSuccess({
      chainId: chainId,
      txHash: txReceipt?.transactionHash,
    });
  }, [txIsSuccess, txReceipt?.transactionHash]);

  return (
    <NetworkGate
      fallback={chainId ? chainIdToNetworkGateFallback[chainId] : <Loading />}
      gate={(data: ActiveChain) => data?.activeChain?.id == chainId}
    >
      <div style={{ textAlign: "center" }}>
        {costIsLoading ? (
          <p>Loading price...</p>
        ) : costIsError ? (
          <p>Failed to fetch price</p>
        ) : (
          <p>
            The mint price for this SBT is{" "}
            <code>
              {costDenominatedInToken.toString()} {currency.symbol}
            </code>
            .
          </p>
        )}

        {prepareTxIsError && (prepareTxError as any)?.details && (
          <p style={{ color: "red" }}>Failed to prepare transaction: {(prepareTxError as any)?.details}</p>
        )}
        {prepareTxIsError && !(prepareTxError as any)?.details && (
          <p style={{ color: "red" }}>Failed to prepare transaction.</p>
        )}

        {txIsError && (txError as any)?.details && (
          <p style={{ color: "red" }}>Failed to send transaction: {(txError as any)?.details}</p>
        )}
        {txIsError && !(txError as any)?.details && (
          <p style={{ color: "red" }}>Failed to send transaction.</p>
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
            disabled={!txIsPrepared || txIsLoading || waitingForTx}
            onClick={(event) => {
              event.preventDefault();
              try {
                if (!sendTransaction)
                  throw new Error("sendTransaction is not defined");
                sendTransaction();
              } catch (err) {
                console.error(err);
                datadogLogs.logger.error(
                  "GovIDPayment error",
                  undefined,
                  err as Error
                );
                datadogRum.addError(err);
              }
            }}
          >
            {preparingTx || txIsLoading
              ? "Loading..."
              : waitingForTx
              ? "Waiting for transaction..."
              : "Submit transaction"}
          </button>
        </div>
      </div>
    </NetworkGate>
  );
};

export default PayWithConnectedWallet;
