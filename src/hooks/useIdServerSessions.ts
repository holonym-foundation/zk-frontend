import { useQuery } from "@tanstack/react-query";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { idServerUrl } from "../constants";
import { IdServerSessionsResponse } from "../types";

/**
 * @param sessionId ID of the id-server session; NOT a Veriff sessionId.
 * @param options 
 */
const useIdServerSessions = (sid?: string, options = {}) => {
  const { holoAuthSigDigest } = useHoloAuthSig();

  const queryKey = sid
    ? ["idvSessionStatus", sid]
    : ["idvSessionStatus"];

  return useQuery<IdServerSessionsResponse>({
    ...options,
    queryKey,
    queryFn: async () => {
      let url = `${idServerUrl}/sessions?sigDigest=${holoAuthSigDigest}`;
      if (sid) {
        url += `&id=${sid}`;
      }
      const resp = await fetch(url);
      return await resp.json();
    },
    refetchInterval: 5000,
  });
};

export default useIdServerSessions;
