import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { idServerUrl } from "../../constants";

const TryDifferentIDVProvider = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const idvProvider = useMemo(() => {
    try {
      const decodedRetrievalEndpoint =
        window.atob(searchParams.get("retrievalEndpoint") ?? "") ?? "";
      return decodedRetrievalEndpoint.split(`${idServerUrl}/`)[1].split("/")[0];
    } catch (err) {
      console.log(err);
      return "onfido";
    }
  }, [searchParams]);
  const otherProvider = idvProvider === "veriff" ? "onfido" : "veriff";

  return (
    <div style={{ textAlign: "center" }}>
      <p>Verification failed with provider {idvProvider}.</p>
      <div
        className="confirmation-modal-buttons"
        style={{
          marginTop: "10px",
          marginBottom: "10px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <button
          className="confirmation-modal-button-confirm"
          onClick={() => navigate(`/issuance/idgov?provider=${otherProvider}`)}
        >
          Try verifying with {otherProvider}
        </button>
      </div>
    </div>
  );
};

export default TryDifferentIDVProvider;
