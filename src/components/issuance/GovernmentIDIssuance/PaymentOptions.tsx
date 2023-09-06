const PaymentOptions = ({
  onSelectOption,
}: {
  onSelectOption: (fiat: boolean, symbol: "ETH" | "FTM") => void;
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
            onSelectOption(false, "FTM");
          }}
        >
          Pay In FTM
        </a>
        <a
          className="glowy-red-button"
          style={{ width: "100%", fontSize: "20px" }}
          onClick={(event) => {
            event.preventDefault();
            onSelectOption(false, "ETH");
          }}
        >
          Pay In OP ETH
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
