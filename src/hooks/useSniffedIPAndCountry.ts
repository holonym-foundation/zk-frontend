
import { useQuery } from "@tanstack/react-query";

const useSniffedIPAndCountry = () => {
  return useQuery({
    queryKey: ["ipAndCountry"],
    queryFn: async () => {
      const resp = await fetch(
        "https://id-server.holonym.io/ip-info/ip-and-country"
      );
      return resp.json();
    },
    staleTime: Infinity,
  });
};

export default useSniffedIPAndCountry
