import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
import { BigNumber } from "bignumber.js";
import { idServerUrl } from "../../constants";
import { Currency, SupportedChainIdsForPayment } from "../../types";

// TODO: Create prod client ID
const payPalClientID = process.env.NODE_ENV == "production" ? "" : "Afploqa3KTb4u4UW5txyMvlIR1UuknqasouKx70kysR6zB3kAdv1oFtqlOxvcAVl7UVwkGMINaOYHgU6"

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
  // const [searchParams] = useSearchParams();
  // const sid = searchParams.get("sid");

  const [{
    isPending: payPalProviderIsPending,
    isResolved: payPalProviderIsResolved,
    isRejected: payPalProviderIsRejected,
  }] = usePayPalScriptReducer();

  const [error, setError] = useState<string>();

  // const createOrder = useCallback(async (data: CreateOrderData, actions: CreateOrderActions) => {
  //   const resp = await fetch(`${idServerUrl}/sessions/${sid}/paypal-order`, {
  //     method: "POST",
  //   })
  //   const respData = await resp.json()
  //   return respData.id
  // }, [sid])

  // const onApprove = useCallback(async (data: OnApproveData, actions: OnApproveActions) => {
  //   onPaymentSuccess({ orderId: data.orderID })
  // }, [sid])

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
