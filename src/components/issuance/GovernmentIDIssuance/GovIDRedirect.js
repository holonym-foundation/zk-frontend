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
  countryToVerificationProvider,
} from "../../../constants";
import VerificationContainer from "../IssuanceContainer";

const steps = ["Verify", "Finalize"];

const useSniffedCountry = () => {
  return useQuery({
    queryKey: ['sniffCountryUsingIp'],
    queryFn: async () => {
      // TODO: USE AN API OVER HTTPS!!
      const resp = await fetch('http://ip-api.com/json?fields=country')
      const data = await resp.json()
      return data.country
    },
    staleTime: Infinity,
  });
}

const GovIDRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const { sortedCreds, loadingCreds } = useCreds()

  const { data: country } = useSniffedCountry();
  const preferredProvider = useMemo(() => {
    // If provider is specified in the URL, use it. Otherwise, use the provider that best
    // suites the country associated with the user's IP address.
    if (searchParams.get('provider') === 'veriff') {
      return 'veriff'
    } else if (searchParams.get('provider') === 'idenfy') {
      return 'idenfy'
    } else if (searchParams.get('provider') === 'onfido') {
      return 'onfido'
    } else {
      return countryToVerificationProvider[country] ?? 'veriff'
    }
  }, [country, searchParams])

  useEffect(() => {
    if (loadingCreds) return;

    // User already has gov id creds. Send them to the confirm reverify page.
    if (sortedCreds?.[serverAddress['idgov-v2']]) {
      navigate('/issuance/idgov-confirm-reverify')
    }

    // Redirect the user to the issuance page that uses the correct IDV provider
    // TODO: Once we have a better IP API, we should wait to get the response
    // from that before redirecting (just like we wait for creds to load).
    navigate(`/issuance/idgov-${preferredProvider}`)

  }, [sortedCreds, loadingCreds])

  return (
    <VerificationContainer steps={steps} currentIdx={0}>
      <div style={{ textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    </VerificationContainer>
  );
};

export default GovIDRedirect;
