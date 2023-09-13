import { useState } from "react";
import { tokenSymbolToCurrency } from "../../../constants";
import CryptoPaymentScreen from "./CryptoPaymentScreen";
import PaymentOptions from "./PaymentOptions";
import { SupportedChainIdsForIDVPayment } from "../../../types";
import PayPalPaymentScreen from "./PayPalPaymentScreen";

const GovIDPayment = ({ 
  onPaymentSuccess,
  onPayPalSyuccess
}: { 
  onPaymentSuccess: (data: { chainId?: number, txHash?: string}) => void 
  onPayPalSyuccess: (data: { username?: string; txId?: string }) => void
}) => {
  const [selectedPage, setSelectedPage] = useState<"options" | "fiat" | "crypto">("options");
  const [selectedToken, setSelectedToken] = useState<"ETH" | "FTM" | "FIAT">();
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

      {selectedPage === "fiat" && selectedToken && (
        <PayPalPaymentScreen
          onPaymentSuccess={onPayPalSyuccess}
          onBack={() => setSelectedPage("options")}
        />
      )}

    </>
  );
};

export default GovIDPayment;
