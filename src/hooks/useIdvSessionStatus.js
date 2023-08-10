import { useQuery } from '@tanstack/react-query'
import { useHoloAuthSig } from "../context/HoloAuthSig";
import { idServerUrl } from "../constants";

const useIdvSessionStatus = (options = {}) => {
  const { holoAuthSigDigest } = useHoloAuthSig();
  
  return useQuery({
    ...options,
    queryKey: ['idvSessionStatus'],
    queryFn: async () => {
      const resp = await fetch(
        `${idServerUrl}/session-status?sigDigest=${holoAuthSigDigest}`
      );
      return await resp.json()
    },
    refetchInterval: 5000,
  });
}

export default useIdvSessionStatus;
