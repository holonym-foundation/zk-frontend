import { useNavigate } from "react-router-dom";
import VerificationContainer from "../IssuanceContainer";
import useSniffedIPAndCountry from '../../../hooks/useSniffedIPAndCountry'
import usePreferredIDVProvider from '../../../hooks/usePreferredIDVProvider'

const ConfirmReverify = () => {
  const navigate = useNavigate();
  const { data: ipAndCountry, isLoading: ipAndCountryIsLoading } =
    useSniffedIPAndCountry();

  const { data: preferredProvider, isLoading: preferredProviderIsLoading } =
    usePreferredIDVProvider(ipAndCountry, {
      enabled: !ipAndCountryIsLoading,
    });

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
            disabled={preferredProviderIsLoading}
            onClick={() => navigate(`/issuance/idgov-${preferredProvider}`)}
          >
            {preferredProviderIsLoading ? 'Loading...' : 'Reverify'}
          </button>
        </div>
      </div>
    </VerificationContainer>
  );
};

export default ConfirmReverify;
