import { useState } from "react";
import { tokenSymbolToCurrency } from "../../../constants";
import CryptoPaymentScreen from "./CryptoPaymentScreen";
import PaymentOptions from "./PaymentOptions";

const GovIDPayment = ({ 
  onPaymentSuccess 
}: { 
  onPaymentSuccess: (data: { chainId?: number, txHash?: string}) => void 
}) => {
  const [selectedPage, setSelectedPage] = useState<"options" | "fiat" | "crypto">("options");
  const [selectedToken, setSelectedToken] = useState<"ETH" | "FTM">();

  return (
    <>
      {selectedPage === "options" && (
        <PaymentOptions
          onSelectOption={(fiat, symbol) => {
            setSelectedPage(fiat ? "fiat" : "crypto");
            setSelectedToken(symbol);
          }}
        />
      )}

      {selectedPage === "crypto" && selectedToken && (
        <CryptoPaymentScreen
          currency={tokenSymbolToCurrency[selectedToken]}
          onPaymentSuccess={onPaymentSuccess}
          onBack={() => setSelectedPage("options")}
        />
      )}

    </>
  );
};

export default GovIDPayment;
