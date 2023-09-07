import { useQuery } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import { 
  PRICE_USD,
  PAYMENT_MARGIN_OF_ERROR_AS_PERCENT,
} from "../constants";
import { fetchMintBondPrice } from "../utils/misc";
import { Currency } from "../types";

const queryFn = async (currency: Currency) => {
  const price = await fetchMintBondPrice(currency);
  return PRICE_USD.div(BigNumber(price)).multipliedBy(
    PAYMENT_MARGIN_OF_ERROR_AS_PERCENT.plus(1)
  )
}

const queryKeyBase = "idvCryptoPrice";

/**
 * Get the total price of MINT+BOND denominated in the given cryptocurrency.
 */
const useFetchIDVCryptoPrice = (currency: Currency, options = {}) => {
  return useQuery({
    ...options,
    queryKey: [queryKeyBase, currency.symbol],
    queryFn: () => queryFn(currency),
    refetchInterval: 20000,
  });
};

export { queryFn, queryKeyBase, useFetchIDVCryptoPrice }
export default useFetchIDVCryptoPrice;
