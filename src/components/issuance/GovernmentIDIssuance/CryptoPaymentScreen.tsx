import { useState } from "react";
import { Modal } from "../../atoms/Modal";
import { Currency } from "../../../types";
import PayWithConnectedWallet from "./PayWithConnectedWallet";
import PayWithDiffWallet from "./PayWithDiffWallet";

const CryptoPaymentScreen = (props: {
  currency: Currency;
  onPaymentSuccess: (data: { chainId?: number; txHash?: string }) => void;
  onBack: () => void;
}) => {
  const [diffWallet, setDiffWallet] = useState(false);
  const [showPayWConnected, setShowPayWConnected] = useState(false);

  return (
    <>
      <Modal
        children={<PayWithDiffWallet {...props} />}
        visible={diffWallet}
        setVisible={setDiffWallet}
      />
      <Modal
        children={<PayWithConnectedWallet {...props} />}
        visible={showPayWConnected}
        setVisible={setShowPayWConnected}
      />
      <div
        className="x-wrapper small-center"
        style={{
          display: "flex",
          height: "95%",
          width: "80%",
          alignItems: "stretch",
          justifyContent: "stretch",
          flexDirection: "column",
          gap: "50px",
        }}
      >
        <h1>Payment Options</h1>
        <a
          className="x-button secondary"
          onClick={(event) => {
            event.preventDefault();
            setShowPayWConnected(true);
          }}
        >
          Continue With This Wallet
        </a>
        <a
          className="x-button secondary outline"
          onClick={(event) => {
            event.preventDefault();
            setDiffWallet(true);
          }}
        >
          Pay From A Burner Wallet
        </a>

        <div
          style={{
            marginTop: "20px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            className="export-private-info-button"
            onClick={(event) => {
              event.preventDefault();
              props.onBack();
            }}
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
};

export default CryptoPaymentScreen;
