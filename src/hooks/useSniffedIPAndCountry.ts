
import { useQuery } from "@tanstack/react-query";
import { IPAndCountry } from "../types";

const useSniffedIPAndCountry = () => {
  return useQuery<IPAndCountry>({
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
