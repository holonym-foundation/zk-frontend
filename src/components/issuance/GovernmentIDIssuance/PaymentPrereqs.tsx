import { useNavigate } from "react-router-dom";
import RoundedWindow from "../../RoundedWindow";

const PaymentPrereqs = () => {
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
              OP ETH or FTM ready to pay the zkNFT minting and Issuer Risk fees
            </li>
            <li>Government ID on-hand</li>
          </ol>
        </div>
        <p>
          The zkNFT minting fee will be refunded if ID verification is
          unsuccessful
        </p>
        {/* <p>This is a privacy-preserving KYC service. We do not store your data beyond the most minimal necessary. We do not sell your data. All sensitive data is protected by zero-knowledge proofs. For more information on how we protect your privacy, see our <a href="/privacy" target="_blank">privacy page</a> or <a href="https://docs.holonym.id/" target="_blank">docs</a>.</p> */}
        <a
          onClick={(event) => {
            event.preventDefault();
            navigate("/issuance/idgov");
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

export default PaymentPrereqs;
