import { useState } from "react";
import { tokenSymbolToCurrency, PRICE_USD } from "../../../constants";
import useFetchIDVCryptoPrice from "../../../hooks/useFetchIDVCryptoPrice";
import PaymentOptions from "../../atoms/PaymentOptions";
import CryptoPaymentScreen from "./CryptoPaymentScreen";
import PayWithPayPal from "../../atoms/PayWithPayPal";
import { SupportedChainIdsForPayment } from "../../../types";

const currencyOptions = {
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
  const [selectedPage, setSelectedPage] = useState<"options" | "fiat" | "crypto">("options");
  const [selectedToken, setSelectedToken] = useState<"ETH" | "FTM">();
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainIdsForPayment>();

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
          onPaymentSuccess={onPaymentSuccess}
        />
      )}

    </>
  );
};

export default GovIDPayment;
