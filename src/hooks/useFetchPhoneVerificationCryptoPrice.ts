import { useQuery } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import { 
  PHONE_PRICE_USD,
  PAYMENT_MARGIN_OF_ERROR_AS_PERCENT,
} from "../constants";
import { fetchCryptoPrice } from "../utils/misc";
import { Currency } from "../types";

const queryFn = async (currency: Currency) => {
  const price = await fetchCryptoPrice(currency);
  return PHONE_PRICE_USD.div(BigNumber(price)).multipliedBy(
    PAYMENT_MARGIN_OF_ERROR_AS_PERCENT.plus(1)
  )
}

const queryKeyBase = "phoneVerificationCryptoPrice";

/**
 * Get the total price of MINT+BOND denominated in the given cryptocurrency.
 */
const useFetchPhoneVerificationCryptoPrice = (currency: Currency, options = {}) => {
  return useQuery({
    ...options,
    queryKey: [queryKeyBase, currency.symbol],
    queryFn: () => queryFn(currency),
    refetchInterval: 20000,
  });
};

export { queryFn, queryKeyBase, useFetchPhoneVerificationCryptoPrice }
export default useFetchPhoneVerificationCryptoPrice;