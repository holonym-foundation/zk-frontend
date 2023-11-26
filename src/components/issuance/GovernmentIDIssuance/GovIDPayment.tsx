import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BigNumber } from "bignumber.js";
import {
  OnApproveData,
  OnApproveActions,
  CreateOrderData,
  CreateOrderActions
} from "@paypal/paypal-js"
import { tokenSymbolToCurrency, PRICE_USD, idServerUrl } from "../../../constants";
import { calculateIDVPrice } from '../../../utils/misc'
import useFetchCryptoPrices from "../../../hooks/useFetchCryptoPrices";
import PaymentOptions from "../../atoms/PaymentOptions";
import CryptoPaymentScreen from "./CryptoPaymentScreen";
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

const GovIDPayment = ({ 
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
    data: cryptoPrices,
    isLoading: priceIsLoading,
    isError: priceIsError,
    isSuccess: priceIsSuccess,
  } = useFetchCryptoPrices(Object.values(currencyOptions));

  const priceInAVAX = useMemo(() => {
    const price = cryptoPrices?.[currencyOptions.avalanche.name.toLowerCase()];
    if (price === undefined) return BigNumber(0);
    return calculateIDVPrice(price);
  }, [cryptoPrices])

  const priceInFTM = useMemo(() => {
    const price = cryptoPrices?.[currencyOptions.fantom.name.toLowerCase()];
    if (price === undefined) return BigNumber(0);
    return calculateIDVPrice(price);
  }, [cryptoPrices])

  const priceInETH = useMemo(() => {
    const price = cryptoPrices?.[currencyOptions.optimism.name.toLowerCase()];
    if (price === undefined) return BigNumber(0);
    return calculateIDVPrice(price);
  }, [cryptoPrices])

  const prices = useMemo(() => {
    return {
      AVAX: priceInAVAX,
      FTM: priceInFTM,
      ETH: priceInETH,
    }
  }, [priceInAVAX, priceInFTM, priceInETH])

  const createOrder = useCallback(async (data: CreateOrderData, actions: CreateOrderActions) => {
    const resp = await fetch(`${idServerUrl}/sessions/${sid}/paypal-order`, {
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
          fiatPrice={PRICE_USD}
        />
      )}

      {selectedPage === "crypto" && selectedToken && (
        <CryptoPaymentScreen
          costDenominatedInToken={prices[selectedToken]}
          costIsLoading={priceIsLoading}
          costIsError={priceIsError}
          costIsSuccess={priceIsSuccess}
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

export default GovIDPayment;
