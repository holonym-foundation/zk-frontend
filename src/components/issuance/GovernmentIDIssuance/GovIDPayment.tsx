import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  OnApproveData,
  OnApproveActions,
  CreateOrderData,
  CreateOrderActions
} from "@paypal/paypal-js"
import { tokenSymbolToCurrency, PRICE_USD, idServerUrl } from "../../../constants";
import useFetchIDVCryptoPrice from "../../../hooks/useFetchIDVCryptoPrice";
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
    data: priceInAVAX,
    isLoading: priceInAVAXIsLoading,
    isError: priceInAVAXIsError,
  } = useFetchIDVCryptoPrice(currencyOptions.avalanche);

  const {
    data: priceInFTM,
    isLoading: priceInFTMIsLoading,
    isError: priceInFTMIsError,
  } = useFetchIDVCryptoPrice(currencyOptions.fantom);

  const {
    data: priceInETH,
    isLoading: priceInETHIsLoading,
    isError: priceInETHIsError,
  } = useFetchIDVCryptoPrice(currencyOptions.optimism);

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
          priceInFTMIsLoading={priceInFTMIsLoading}
          priceInFTMIsError={priceInFTMIsError}
          priceInAVAX={priceInAVAX}
          priceInAVAXIsLoading={priceInAVAXIsLoading}
          priceInAVAXIsError={priceInAVAXIsError}
          priceInETH={priceInETH}
          priceInETHIsLoading={priceInETHIsLoading}
          priceInETHIsError={priceInETHIsError}
          fiatPrice={PRICE_USD}
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

export default GovIDPayment;
