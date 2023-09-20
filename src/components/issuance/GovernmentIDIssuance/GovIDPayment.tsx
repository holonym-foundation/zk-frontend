import { useState } from "react";
import { tokenSymbolToCurrency } from "../../../constants";
import CryptoPaymentScreen from "./CryptoPaymentScreen";
import PaymentOptions from "./PaymentOptions";
import { SupportedChainIdsForIDVPayment } from "../../../types";

const GovIDPayment = ({ 
  onPaymentSuccess 
}: { 
  onPaymentSuccess: (data: { chainId?: number, txHash?: string }) => void 
}) => {
  const [selectedPage, setSelectedPage] = useState<"options" | "fiat" | "crypto">("options");
  const [selectedToken, setSelectedToken] = useState<"ETH" | "FTM">();
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainIdsForIDVPayment>();

  return (
    <>
      {selectedPage === "options" && (
        <PaymentOptions
          onSelectOption={(fiat, symbol, chainId) => {
            setSelectedPage(fiat ? "fiat" : "crypto");
            setSelectedToken(symbol);
            setSelectedChainId(chainId);
          }}
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

export default GovIDPayment;
