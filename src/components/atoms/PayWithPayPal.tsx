import { useState } from "react";
import { 
  PayPalScriptProvider, 
  PayPalButtons, 
  usePayPalScriptReducer, 
  FUNDING as PAYPAL_FUNDING_SOURCE,
} from "@paypal/react-paypal-js";
import {
  OnApproveData,
  OnApproveActions,
  CreateOrderData,
  CreateOrderActions
} from "@paypal/paypal-js"
import { payPalClientID } from "../../constants";

const payPalOptions = {
  clientId: payPalClientID,
  currency: "USD",
  intent: "capture",
  commit: true,
  components: "buttons",
};

const PayWithPayPalGuts = ({
  createOrder,
  onApprove,
}: {
  createOrder: (data: CreateOrderData, actions: CreateOrderActions) => Promise<string>;
  onApprove: (data: OnApproveData, actions: OnApproveActions) => Promise<void>;
}) => {
  const [{
    isPending: payPalProviderIsPending,
    isResolved: payPalProviderIsResolved,
    isRejected: payPalProviderIsRejected,
  }] = usePayPalScriptReducer();

  const [error, setError] = useState<string>();

  return (
    <>
      <ol style={{ fontSize: "14px", paddingLeft: "20px" }}>
        <li>
          <p>Pay with PayPal.</p>
        </li>
        <li>
          <p>You will be redirected when payment is successful.</p>
        </li>
      </ol>

      <br />

      <div
        className="x-wrapper small-center"
        style={{ height: "95%", width: "80%" }}
      >
        {payPalProviderIsPending && <p>Loading PayPal...</p>}
        {payPalProviderIsRejected && <p style={{ color: "red" }}>Failed to load PayPal</p>}
        {payPalProviderIsResolved && (
          <>
            <PayPalButtons 
              // style={{ layout: "vertical" }}
              disabled={false}
              // forceReRender={[style]}
              fundingSource={PAYPAL_FUNDING_SOURCE.PAYPAL}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={(err) => {
                console.error('PayPal threw error:', err)
                setError('Encountered an unknown error from PayPal')
              }}
            />
          </>
        )}
      </div>

      {error && (
        <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "0px" }}>
          <p style={{ color: "red", fontSize: "14px", marginBottom: "0px" }}>
            {error}
          </p>
        </div>
      )}
    </>
  );
};

const PayWithPayPal = ({
  createOrder,
  onApprove,
}: {
  createOrder: (data: CreateOrderData, actions: CreateOrderActions) => Promise<string>;
  onApprove: (data: OnApproveData, actions: OnApproveActions) => Promise<void>;
}) => {
  return (
    <>
      <h1>Pay with Fiat</h1>
      <br />

      <PayPalScriptProvider options={payPalOptions}>
        <PayWithPayPalGuts
          createOrder={createOrder}
          onApprove={onApprove}
        />
      </PayPalScriptProvider>
    </>
  );
};

export default PayWithPayPal;
