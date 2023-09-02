import { useNavigate } from "react-router-dom";
import VerificationContainer from "../IssuanceContainer";
import useSniffedIPAndCountry from '../../../hooks/useSniffedIPAndCountry'
import usePreferredIDVProvider from '../../../hooks/usePreferredIDVProvider'
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
              // TODO: See GovIDRedirect component and the cases handled in there wrt
              // the different possible session states. Handle the same cases here.
              createSessionAsync()
                .then((data: { session: { _id: string }}) => 
                  navigate(`/issuance/idgov-${preferredProvider}?sid=${data.session._id}`)
                )
                .catch(console.error)
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
