import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";

const useHashSid = () => {
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");

  return useMemo(() => {
    if (!sid) return null
    // sids are always hex strings without the 0x prefix, so we only need
    // to prepend the 0x here. We don't need to encode the string first.
    return ethers.utils.keccak256('0x' + sid) as `0x${string}`;
  }, [sid])
};

export default useHashSid;
