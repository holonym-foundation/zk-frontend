import { useQuery } from "@tanstack/react-query";
import { idServerUrl } from "../constants";
import { SessionStatusResponse } from "../types";

const useIdvSessionStatus = (sid?: string, options = {}) => {
  const queryKey = sid
    ? ["idvSessionStatus", sid]
    : ["idvSessionStatus"];

  return useQuery<Partial<SessionStatusResponse>>({
    ...options,
    queryKey,
    queryFn: async () => {
      if (!sid) return {};
      const url = `${idServerUrl}/session-status/v2?sid=${sid}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Failed to get session status. Response status code: ${resp.status}`);
      }
      return resp.json();
    },
    refetchInterval: 5000,
  });
};

export default useIdvSessionStatus;
