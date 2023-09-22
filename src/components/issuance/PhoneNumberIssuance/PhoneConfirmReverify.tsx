import { useNavigate } from "react-router-dom";
import { getPhoneSessionPath } from '../../../utils/misc';
import VerificationContainer from "../IssuanceContainer";
import usePhoneServerSessions from '../../../hooks/usePhoneServerSessions'
import useCreatePhoneServerSession from '../../../hooks/useCreatePhoneServerSession'

const PhoneConfirmReverify = () => {
  const navigate = useNavigate();

  const {
    data: phoneServerSessions,
    isLoading: phoneServerSessionsIsLoading,
  } = usePhoneServerSessions();

  const {
    mutateAsync: createSessionAsync
  } = useCreatePhoneServerSession();

  return (
    <VerificationContainer steps={[]} currentIdx={0}>
      <div style={{ textAlign: "center" }}>
        <p>It looks like you already have phone number credentials.</p>
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
            disabled={phoneServerSessionsIsLoading}
            onClick={() => {
              const path = getPhoneSessionPath(phoneServerSessions);
              if (path) {
                navigate(path)
                return;
              }

              createSessionAsync()
                .then((data: { session: { id: string }}) => {
                  navigate(`/issuance/phone-verify?sid=${data.session.id}`);    
                })
                .catch((err) => {
                  console.error('Error creating session:', err)
                })
            }}
          >
            {phoneServerSessionsIsLoading ? 'Loading...' : 'Reverify'}
          </button>
        </div>
      </div>
    </VerificationContainer>
  );
};

export default PhoneConfirmReverify;
