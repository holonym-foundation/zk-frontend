import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalPaymentScreen = (props: {
  onPaymentSuccess: (data: { username?: string; txId?: string }) => void;
  onBack: () => void;
}) => {

  return (
    <>
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
        <PayPalScriptProvider options={{clientId: "test"}}>
          <PayPalButtons />
        </PayPalScriptProvider>

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

export default PayPalPaymentScreen;
