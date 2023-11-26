import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BigNumber } from "bignumber.js";
import {
  OnApproveData,
  OnApproveActions,
  CreateOrderData,
  CreateOrderActions
} from "@paypal/paypal-js"
import { tokenSymbolToCurrency, PHONE_PRICE_USD, zkPhoneEndpoint } from "../../../constants";
import { calculatePhonePrice } from '../../../utils/misc'
import useFetchCryptoPrices from "../../../hooks/useFetchCryptoPrices";
import CryptoPaymentScreen from "./CryptoPaymentScreen";
import PaymentOptions from "../../atoms/PaymentOptions";
import PayWithPayPal from "../../atoms/PayWithPayPal";
import { SupportedChainIdsForPayment } from "../../../types";

const currencyOptions = {
  avalanche: {
    symbol: "AVAX",
    name: "Avalanche",
  },
  fantom: {
    symbol: "FTM",
    name: "Fantom",
  },
  optimism: {
    symbol: "ETH",
    name: "Ethereum",
  },
}

const PhonePayment = ({ 
  onPaymentSuccess 
}: { 
  onPaymentSuccess: (data: { chainId?: number, txHash?: string, orderId?: string }) => void 
}) => {
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");

  const [selectedPage, setSelectedPage] = useState<"options" | "fiat" | "crypto">("options");
  const [selectedToken, setSelectedToken] = useState<"ETH" | "FTM" | "AVAX">();
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainIdsForPayment>();

  const {
    data: prices,
    isLoading: priceIsLoading,
    isError: priceIsError,
    isSuccess: priceIsSuccess,
  } = useFetchCryptoPrices(Object.values(currencyOptions));

  const priceInAVAX = useMemo(() => {
    console.log(prices)
    const price = prices?.[currencyOptions.avalanche.name.toLowerCase()];
    console.log(price)
    if (price === undefined) return BigNumber(0);
    console.log(calculatePhonePrice(price))
    return calculatePhonePrice(price);
  }, [prices])

  const priceInFTM = useMemo(() => {
    const price = prices?.[currencyOptions.fantom.name.toLowerCase()];
    if (price === undefined) return BigNumber(0);
    return calculatePhonePrice(price);
  }, [prices])

  const priceInETH = useMemo(() => {
    const price = prices?.[currencyOptions.optimism.name.toLowerCase()];
    if (price === undefined) return BigNumber(0);
    return calculatePhonePrice(price);
  }, [prices])

  const createOrder = useCallback(async (data: CreateOrderData, actions: CreateOrderActions) => {
    const resp = await fetch(`${zkPhoneEndpoint}/sessions/${sid}/paypal-order`, {
      method: "POST",
    })
    const respData = await resp.json()
    return respData.id
  }, [sid])

  const onApprove = useCallback(async (data: OnApproveData, actions: OnApproveActions) => {
    onPaymentSuccess({ orderId: data.orderID })
  }, [sid])

  return (
    <>
      {selectedPage === "options" && (
        <PaymentOptions
          onSelectOption={(fiat, symbol, chainId) => {
            setSelectedPage(fiat ? "fiat" : "crypto");
            setSelectedToken(symbol);
            setSelectedChainId(chainId);
          }}
          priceInFTM={priceInFTM}
          priceInFTMIsLoading={priceIsLoading}
          priceInFTMIsError={priceIsError}
          priceInAVAX={priceInAVAX}
          priceInAVAXIsLoading={priceIsLoading}
          priceInAVAXIsError={priceIsError}
          priceInETH={priceInETH}
          priceInETHIsLoading={priceIsLoading}
          priceInETHIsError={priceIsError}
          fiatPrice={PHONE_PRICE_USD}
        />
      )}

      {selectedPage === "crypto" && selectedToken && (
        <CryptoPaymentScreen
          currency={tokenSymbolToCurrency[selectedToken]}
          chainId={selectedChainId}
          onPaymentSuccess={onPaymentSuccess}
          onBack={() => setSelectedPage("options")}
        />
      )}

      {selectedPage === "fiat" && (
        <PayWithPayPal 
          createOrder={createOrder}
          onApprove={onApprove}
        />
      )}
    </>
  );
};

export default PhonePayment;
