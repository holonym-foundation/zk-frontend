import { useQuery } from "@tanstack/react-query";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { idServerUrl } from "../constants";
import { SessionStatusResponse } from "../types";

const useIdvSessionStatus = (idvProvider?: string, options = {}) => {
  const { holoAuthSigDigest } = useHoloAuthSig();

  const queryKey = idvProvider
    ? ["idvSessionStatus", idvProvider]
    : ["idvSessionStatus"];

  return useQuery<Partial<SessionStatusResponse>>({
    ...options,
    queryKey,
    queryFn: async () => {
      let url = `${idServerUrl}/session-status?sigDigest=${holoAuthSigDigest}`;
      if (idvProvider) {
        url += `&provider=${idvProvider}`;
      }
      const resp = await fetch(url);
      return await resp.json();
    },
    refetchInterval: 5000,
  });
};

export default useIdvSessionStatus;
