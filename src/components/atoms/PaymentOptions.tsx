import { BigNumber } from "bignumber.js";
import { SupportedChainIdsForPayment } from "../../types";

const PaymentOptions = ({
  onSelectOption,
  priceInFTM,
  priceInFTMIsLoading,
  priceInFTMIsError,
  priceInETH,
  priceInETHIsLoading,
  priceInETHIsError,
}: {
  onSelectOption: (
    fiat: boolean, 
    symbol: "ETH" | "FTM", 
    chainId: SupportedChainIdsForPayment
  ) => void;
  priceInFTM?: BigNumber;
  priceInFTMIsLoading?: boolean;
  priceInFTMIsError?: boolean;
  priceInETH?: BigNumber;
  priceInETHIsLoading?: boolean;
  priceInETHIsError?: boolean;
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
        <h1>Bond & Fee</h1>

        <a
          className="glowy-green-button"
          style={{ width: "100%", fontSize: "20px" }}
          onClick={(event) => {
            event.preventDefault();
            onSelectOption(false, "FTM", 250);
          }}
        >
          Pay In FTM ({
            priceInFTMIsLoading ? "loading..." : priceInFTMIsError ? "error" : `${priceInFTM && priceInFTM.decimalPlaces(4).toString()} FTM`
          })
        </a>

        <a
          className="glowy-grey-button"
          style={{ width: "100%", fontSize: "20px" }}
          onClick={(event) => {
            event.preventDefault();
            onSelectOption(false, "ETH", 1);
          }}
        >
          Pay In ETH (on Ethereum mainnet) ({
            priceInETHIsLoading ? "loading..." : priceInETHIsError ? "error" : `${priceInETH && priceInETH.decimalPlaces(4).toString()} ETH`
          })
        </a>

        <a
          className="glowy-red-button"
          style={{ width: "100%", fontSize: "20px" }}
          onClick={(event) => {
            event.preventDefault();
            onSelectOption(false, "ETH", process.env.NODE_ENV === "development" ? 420 : 10);
          }}
        >
          Pay In ETH (on Optimism) ({
            priceInETHIsLoading ? "loading..." : priceInETHIsError ? "error" : `${priceInETH && priceInETH.decimalPlaces(4).toString()} ETH`
          })
        </a>
        <a
          className="x-button-blue greyed-out-button"
          style={{ width: "100%", fontSize: "20px" }}
        >
          Pay In Fiat (coming soon)
        </a>
      </div>
    </>
  );
};

export default PaymentOptions;
