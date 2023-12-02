import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import {
  usePrepareSendTransaction,
} from "wagmi";
import { SupportedChainIdsForPayment } from "../types";
import useHashSid from './useHashSid';

/**
 * Wrapper around wagmi's usePrepareSendTransaction, but sets tx.data to hash of sid.
 */
const usePrepareTxWithSid = ({
  value,
  to,
  chainId,
}: {
  value: bigint;
  to: `0x${string}`;
  chainId?: SupportedChainIdsForPayment;
}) => {
  const sidDigest = useHashSid();

  const data = usePrepareSendTransaction({
    chainId,
    to,
    value,
    data: sidDigest ?? '0x',
  });

  const error = useMemo(() => {
    if (sidDigest && data.error) {
      return data.error
    } else if (!sidDigest && !data.error) {
      return new Error('Invalid sidDigest')
    } else if (!sidDigest && data.error) {
      return new Error('Invalid sidDigest and transaction error. Transaction error: ' + data.error.message)
    } else {
      return null
    }
  }, [data, sidDigest])

  return {
    ...data,
    error
  }
};

export default usePrepareTxWithSid;
