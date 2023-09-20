import { SupportedChainIdsForIDVPayment } from "../../../types";
import useFetchIDVCryptoPrice from "../../../hooks/useFetchIDVCryptoPrice";

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

const PaymentOptions = ({
  onSelectOption,
}: {
  onSelectOption: (
    fiat: boolean, 
    symbol: "ETH" | "FTM", 
    chainId: SupportedChainIdsForIDVPayment
  ) => void;
}) => {
  const {
    data: priceInFTM,
    isLoading: priceInFTMIsLoading,
    isError: priceInFTMIsError,
  } = useFetchIDVCryptoPrice(currencyOptions.fantom);

  const {
    data: priceInETH,
    isLoading: priceInETHIsLoading,
    isError: priceInETHIsError,
  } = useFetchIDVCryptoPrice(currencyOptions.optimism);

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
            priceInFTMIsLoading ? "loading..." : priceInFTMIsError ? "error" : `${priceInFTM.decimalPlaces(4).toString()} FTM`
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
            priceInETHIsLoading ? "loading..." : priceInETHIsError ? "error" : `${priceInETH.decimalPlaces(4).toString()} ETH`
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
            priceInETHIsLoading ? "loading..." : priceInETHIsError ? "error" : `${priceInETH.decimalPlaces(4).toString()} ETH`
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
