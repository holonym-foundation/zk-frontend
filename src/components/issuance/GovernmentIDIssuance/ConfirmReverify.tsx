import { useNavigate } from "react-router-dom";
import { getSessionPath } from '../../../utils/misc';
import VerificationContainer from "../IssuanceContainer";
import useSniffedIPAndCountry from '../../../hooks/useSniffedIPAndCountry'
import usePreferredIDVProvider from '../../../hooks/usePreferredIDVProvider'
import useIdServerSessions from '../../../hooks/useIdServerSessions'
import useCreateIdServerSession from '../../../hooks/useCreateIdServerSession'

const ConfirmReverify = () => {
  const navigate = useNavigate();
  const { data: ipAndCountry, isLoading: ipAndCountryIsLoading } =
    useSniffedIPAndCountry();

  const { data: preferredProvider, isLoading: preferredProviderIsLoading } =
    usePreferredIDVProvider(ipAndCountry, {
      enabled: !ipAndCountryIsLoading,
    });

  const {
    mutateAsync: createSessionAsync
  } = useCreateIdServerSession({
    preferredProvider
  });

  const {
    data: idServerSessions,
    isLoading: idServerSessionsIsLoading,
  } = useIdServerSessions();

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
            onClick={() => {
              const path = getSessionPath(idServerSessions);
              if (path) {
                navigate(path)
                return;
              }

              createSessionAsync()
                .then((data: { session: { _id: string }}) => {
                  // Redirect the user to the issuance page that uses the correct IDV provider
                  navigate(`/issuance/idgov-${preferredProvider}?sid=${data.session._id}`);    
                })
                .catch((err) => {
                  console.error('Error creating session:', err)
                })
            }}
          >
            {preferredProviderIsLoading ? 'Loading...' : 'Reverify'}
          </button>
        </div>
      </div>
    </VerificationContainer>
  );
};

export default ConfirmReverify;
