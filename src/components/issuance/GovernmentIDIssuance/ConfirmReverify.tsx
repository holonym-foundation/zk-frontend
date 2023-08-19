import { useNavigate } from "react-router-dom";
import VerificationContainer from "../IssuanceContainer";

const ConfirmReverify = () => {
  const navigate = useNavigate();

  return (
    <VerificationContainer steps={[]} currentIdx={0}>
      <div style={{ textAlign: "center" }}>
        <p>It looks like you already have govnerment ID credentials.</p>
        <p>Are you sure you want to reverify?</p>
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
            style={{
              lineHeight: "1",
              fontSize: "16px",
            }}
            onClick={() => navigate("/issuance/idgov-veriff")}
          >
            Reverify
          </button>
        </div>
      </div>
    </VerificationContainer>
  );
};

export default ConfirmReverify;
