import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getIDVProvider } from "../utils/misc";
import { IPAndCountry } from "../types";

const usePreferredIDVProvider = (
  ipAndCountry: IPAndCountry,
  {
    enabled,
  }: {
    enabled: boolean;
  }
) => {
  const [searchParams] = useSearchParams();

  return useQuery({
    queryKey: ["preferredIDVProvider"],
    queryFn: async () => {
      let preferredProvider = "veriff";
      // If provider is specified in the URL, use it. Otherwise, use the provider that best
      // suites the country associated with the user's IP address.
      if (searchParams.get("provider") === "veriff") {
        preferredProvider = "veriff";
      } else if (searchParams.get("provider") === "idenfy") {
        preferredProvider = "idenfy";
      } else if (searchParams.get("provider") === "onfido") {
        preferredProvider = "onfido";
      } else {
        preferredProvider = await getIDVProvider(
          ipAndCountry?.ip,
          ipAndCountry?.country
        );
      }

      return preferredProvider;
    },
    staleTime: Infinity,
    enabled: enabled,
  });
};

export default usePreferredIDVProvider
