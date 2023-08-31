/**
 * A component for performing redirection, based on app state, to the correct GovID
 * issuance page.
 */
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCreds } from "../../../context/Creds";
import { serverAddress } from "../../../constants";
import VerificationContainer from "../IssuanceContainer";
import useSniffedIPAndCountry from '../../../hooks/useSniffedIPAndCountry'
import usePreferredIDVProvider from '../../../hooks/usePreferredIDVProvider'

const steps = ["Verify", "Finalize"];

const GovIDRedirect = () => {
  const navigate = useNavigate();
  const { sortedCreds, loadingCreds } = useCreds();

  const { data: ipAndCountry, isLoading: ipAndCountryIsLoading } =
    useSniffedIPAndCountry();

  const { data: preferredProvider, isLoading: preferredProviderIsLoading } =
    usePreferredIDVProvider(ipAndCountry, {
      enabled: !ipAndCountryIsLoading,
    });

  useEffect(
    () => {
      if (loadingCreds || ipAndCountryIsLoading || preferredProviderIsLoading)
        return;

      // User already has gov id creds. Send them to the confirm reverify page.
      if (sortedCreds?.[serverAddress["idgov-v2"]]) {
        navigate("/issuance/idgov-confirm-reverify");
        return;
      }

      // Redirect the user to the issuance page that uses the correct IDV provider
      navigate(`/issuance/idgov-${preferredProvider}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      sortedCreds,
      loadingCreds,
      ipAndCountryIsLoading,
      preferredProviderIsLoading,
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
