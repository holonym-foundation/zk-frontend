import { useState } from "react";
import { tokenSymbolToCurrency } from "../../../constants";
import useFetchPhoneVerificationCryptoPrice from "../../../hooks/useFetchPhoneVerificationCryptoPrice";
import CryptoPaymentScreen from "./CryptoPaymentScreen";
import PaymentOptions from "../../atoms/PaymentOptions";
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

const PhonePayment = ({ 
  onPaymentSuccess 
}: { 
  onPaymentSuccess: (data: { chainId?: number, txHash?: string }) => void 
}) => {
  const [selectedPage, setSelectedPage] = useState<"options" | "fiat" | "crypto">("options");
  const [selectedToken, setSelectedToken] = useState<"ETH" | "FTM">();
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainIdsForPayment>();

  const {
    data: priceInFTM,
    isLoading: priceInFTMIsLoading,
    isError: priceInFTMIsError,
  } = useFetchPhoneVerificationCryptoPrice(currencyOptions.fantom);

  const {
    data: priceInETH,
    isLoading: priceInETHIsLoading,
    isError: priceInETHIsError,
  } = useFetchPhoneVerificationCryptoPrice(currencyOptions.optimism);
  
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

    </>
  );
};

export default PhonePayment;
