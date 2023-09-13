/**
 * A component for performing redirection, based on app state, to the correct GovID
 * issuance page.
 */
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreds } from "../../../context/Creds";
import { serverAddress } from "../../../constants";
import { getSessionPath } from '../../../utils/misc';
import VerificationContainer from "../IssuanceContainer";
import useSniffedIPAndCountry from '../../../hooks/useSniffedIPAndCountry'
import usePreferredIDVProvider from '../../../hooks/usePreferredIDVProvider'
import useIdServerSessions from '../../../hooks/useIdServerSessions'
import useCreateIdServerSession from '../../../hooks/useCreateIdServerSession'

const steps = ["Pay", "Verify", "Finalize"];

const GovIDRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const provider = searchParams.get("provider");
  const { sortedCreds, loadingCreds } = useCreds();

  const { data: ipAndCountry, isLoading: ipAndCountryIsLoading } =
    useSniffedIPAndCountry();

  const { data: preferredProvider, isLoading: preferredProviderIsLoading } =
    usePreferredIDVProvider(ipAndCountry, {
      enabled: !ipAndCountryIsLoading,
    });

  const {
    data: idServerSessions,
    isLoading: idServerSessionsIsLoading,
  } = useIdServerSessions();

  const {
    mutateAsync: createSessionAsync
  } = useCreateIdServerSession({
    preferredProvider
  });

  useEffect(
    () => {
      if (loadingCreds || ipAndCountryIsLoading || preferredProviderIsLoading || idServerSessionsIsLoading)
        return;

      // If user is from Iran, redirect them to the info page about Iran.
      if (ipAndCountry?.country === "Iran") {
        navigate("/iran-info");
        return;
      }

      // User already has gov id creds. Send them to the confirm reverify page.
      if (sortedCreds?.[serverAddress["idgov-v2"]]) {
        let url = `/issuance/idgov-confirm-reverify`;
        if (provider) {
          url += `?provider=${provider}`;
        }
        navigate(url);
        return;
      }

      // If user already has one or more sessions, redirect them to the correct
      // one. Otherwise, redirect them to the issuance page for the preferred
      // provider.

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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      sortedCreds,
      loadingCreds,
      ipAndCountryIsLoading,
      preferredProviderIsLoading,
      idServerSessionsIsLoading,
    ]
  );

  return (
    <VerificationContainer steps={steps} currentIdx={0}>
      <div style={{ textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    </VerificationContainer>
  );
};

export default GovIDRedirect;
