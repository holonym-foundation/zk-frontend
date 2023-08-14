/**
 * A component for performing redirection, based on app state, to the correct GovID
 * issuance page.
 */
import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import { useCreds } from "../../../context/Creds";
import {
  serverAddress,
} from "../../../constants";
import { getIDVProvider } from "../../../utils/misc";
import VerificationContainer from "../IssuanceContainer";

const steps = ["Verify", "Finalize"];

const useSniffedIpAndCountry = () => {
  return useQuery({
    queryKey: ['ipAndCountry'],
    queryFn: async () => {
      const resp = await fetch('https://id-server.holonym.io/ip-info/ip-and-country')
      return resp.json()
    },
    staleTime: Infinity,
  });
}

const usePreferredProvider = (ipAndCountry, { enabled }) => {
  const [searchParams] = useSearchParams()

  return useQuery({
    queryKey: ['preferredIDVProvider'],
    queryFn: async () => {
      let preferredProvider = 'veriff'
      // If provider is specified in the URL, use it. Otherwise, use the provider that best
      // suites the country associated with the user's IP address.
      if (searchParams.get('provider') === 'veriff') {
        preferredProvider = 'veriff'
      } else if (searchParams.get('provider') === 'idenfy') {
        preferredProvider = 'idenfy'
      } else if (searchParams.get('provider') === 'onfido') {
        preferredProvider = 'onfido'
      } else {
        preferredProvider = await getIDVProvider(ipAndCountry?.ip, ipAndCountry?.country)
      }

      return preferredProvider
    },
    staleTime: Infinity,
    enabled: enabled
  });
}

const GovIDRedirect = () => {
  const navigate = useNavigate();
  const { sortedCreds, loadingCreds } = useCreds()

  const { 
    data: ipAndCountry, 
    isLoading: ipAndCountryIsLoading
  } = useSniffedIpAndCountry();

  const {
    data: preferredProvider,
    isLoading: preferredProviderIsLoading
  } = usePreferredProvider(ipAndCountry, {
    enabled: !ipAndCountryIsLoading
  });

  useEffect(() => {
    if (loadingCreds || ipAndCountryIsLoading || preferredProviderIsLoading) return;

    // User already has gov id creds. Send them to the confirm reverify page.
    if (sortedCreds?.[serverAddress['idgov-v2']]) {
      navigate('/issuance/idgov-confirm-reverify')
      return;
    }

    // Redirect the user to the issuance page that uses the correct IDV provider
    navigate(`/issuance/idgov-${preferredProvider}`)

  }, [sortedCreds, loadingCreds, ipAndCountryIsLoading, preferredProviderIsLoading])

  return (
    <VerificationContainer steps={steps} currentIdx={0}>
      <div style={{ textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    </VerificationContainer>
  );
};

export default GovIDRedirect;
