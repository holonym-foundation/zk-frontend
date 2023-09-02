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
      return await resp.json();
    },
    refetchInterval: 5000,
  });
};

export default useIdvSessionStatus;
