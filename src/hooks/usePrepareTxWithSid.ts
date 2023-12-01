import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import {
  usePrepareSendTransaction,
} from "wagmi";
import { SupportedChainIdsForPayment } from "../types";

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
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");

  const sidDigest = useMemo(() => {
    if (!sid) return null
    // sids are always hex strings without the 0x prefix, so we only need
    // to prepend the 0x here. We don't need to encode the string first.
    return ethers.utils.keccak256('0x' + sid) as `0x${string}`;
  }, [sid])

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
