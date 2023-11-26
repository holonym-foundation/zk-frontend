import { useQuery } from "@tanstack/react-query";
import { 
  idServerUrl
} from "../constants";
import { Currency } from "../types";

const queryFn = async (currencies: Currency[]) => {
  const slugs = currencies.map((c) => c.name.toLowerCase()).join(",")
  const priceData = await fetch(`${idServerUrl}/prices/v2?slug=${slugs}`)

  if (priceData.status !== 200) {
    throw new Error("Failed to fetch price");
  } else {
    return await priceData.json()
  }
}

const queryKeyBase = "cryptoPricesUSD";

const useFetchCryptoPrices = (currencies: Currency[], options = {}) => {
  return useQuery<{ [slug: string]: number }>({
    ...options,
    queryKey: [queryKeyBase, ...currencies.map((c) => c.symbol)],
    queryFn: () => queryFn(currencies),
    refetchInterval: 30000,
  });
};

export { queryFn, queryKeyBase, useFetchCryptoPrices }
export default useFetchCryptoPrices;
