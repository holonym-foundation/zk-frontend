/**
 * A component for performing redirection, based on app state, to the correct
 * phone number issuance page.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreds } from "../../../context/Creds";
import { serverAddress, unsupportedCountries } from "../../../constants";
import { getPhoneSessionPath } from '../../../utils/misc';
import VerificationContainer from "../IssuanceContainer";
import useSniffedIPAndCountry from "../../../hooks/useSniffedIPAndCountry";
import usePhoneServerSessions from '../../../hooks/usePhoneServerSessions'
import useCreatePhoneServerSession from '../../../hooks/useCreatePhoneServerSession'

const steps = ["Pay", "Phone#", "Verify", "Finalize"];

const PhoneNumberRedirect = () => {
  const navigate = useNavigate();
  const { sortedCreds, loadingCreds } = useCreds();

  const { data: ipAndCountry, isLoading: ipAndCountryIsLoading } =
    useSniffedIPAndCountry();

  const {
    data: phoneServerSessions,
    isLoading: phoneServerSessionsIsLoading,
  } = usePhoneServerSessions();

  const {
    mutateAsync: createSessionAsync
  } = useCreatePhoneServerSession();

  useEffect(
    () => {
      if (loadingCreds || phoneServerSessionsIsLoading)
        return;

      if (unsupportedCountries.includes(ipAndCountry?.country as string)) {
        navigate("/unsupported-country");
        return;
      }

      // User already has phone creds. Send them to the confirm reverify page.
      if (sortedCreds?.[serverAddress["idgov-v2"]]) {
        navigate(`/issuance/phone-confirm-reverify`);
        return;
      }

      // If user already has one or more sessions, redirect them to the correct
      // one. Otherwise, redirect them to the issuance page for the preferred
      // provider.

      const path = getPhoneSessionPath(phoneServerSessions);
      if (path) {
        navigate(path)
        return;
      }

      createSessionAsync()
        .then((data: { session: { id: { S: string } }}) => {
          console.log('session:', data)
          navigate(`/issuance/phone-verify?sid=${data.session.id.S}`);    
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
      phoneServerSessionsIsLoading,
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

export default PhoneNumberRedirect;
