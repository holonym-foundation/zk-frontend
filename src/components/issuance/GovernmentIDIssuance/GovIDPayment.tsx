import { useState, useEffect, useMemo } from "react";
import { tokenSymbolToCurrency } from "../../../constants";
import {
  PaymentOptions, 
  PaymentScreen as CryptoPaymentScreen
} from "../../payment"

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
