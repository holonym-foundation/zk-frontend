import { useEffect } from "react";
import { datadogLogs } from "@datadog/browser-logs";
import { useNavigate } from "react-router-dom";
import RoundedWindow from "../../RoundedWindow";

const PhonePaymentPrereqs = () => {
  useEffect(() => {
    try {
      datadogLogs.logger.info('ViewPhonePrereqs', {})
    } catch (err) {
      // do nothing
    }
  }, [])

  const navigate = useNavigate();

  return (
    <RoundedWindow>
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
        <h1>Before we proceed, make sure you have:</h1>

        <div className="checklist">
          <ol>
            <li>
              {/* zkNFT minting {" "}
              <code style={{ color: "var(--holo-light-blue)" }}>($10)</code>{" "}
              and Issuer Risk {" "}
              <code style={{ color: "var(--holo-light-blue)" }}>($2.47)</code> fees:
              Crypto or Fiat accepted. */}
              ETH (on mainnet or Optimism), FTM, or AVAX ready to pay the zkNFT minting and Issuer Risk fees
            </li>
            <li>Phone in-hand</li>
          </ol>
        </div>
        <p>
          The zkNFT minting fee will be refunded if ID verification is
          unsuccessful
        </p>
        <a
          onClick={(event) => {
            event.preventDefault();
            navigate("/issuance/phone");
          }}
          className="glowy-green-button"
          style={{ width: "100%", fontSize: "20px" }}
        >
          Continue
        </a>
        <p>
          This is a privacy-centric service. For more info, see{" "}
          <a href="/privacy" target="_blank">
            privacy
          </a>
        </p>
      </div>
    </RoundedWindow>
  );
};

export default PhonePaymentPrereqs;
