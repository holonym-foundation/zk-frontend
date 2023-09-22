import { useQuery } from "@tanstack/react-query";
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { zkPhoneEndpoint } from "../constants";
import { PhoneServerSessionsResponse } from "../types";

/**
 * @param sid ID of the phone-number-server session.
 * @param options 
 */
const usePhoneServerSessions = (sid?: string, options = {}) => {
  const { holoAuthSigDigest } = useHoloAuthSig();

  const queryKey = sid
    ? ["phoneServerSession", sid]
    : ["phoneServerSession"];

  return useQuery<PhoneServerSessionsResponse>({
    ...options,
    queryKey,
    queryFn: async () => {
      let url = `${zkPhoneEndpoint}/sessions?sigDigest=${holoAuthSigDigest}`;
      if (sid) {
        url += `&id=${sid}`;
      }
      const resp = await fetch(url);
      return await resp.json();
    },
    refetchInterval: 5000,
  });
};

export default usePhoneServerSessions;
