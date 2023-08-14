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
      const resp = await fetch('https://id-server.holonym.io/ip-info/country')
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

  const { 
    data: country, 
    isLoading: countryIsLoading
  } = useSniffedCountry();
  console.log('country', country)

  useEffect(() => {
    if (loadingCreds || countryIsLoading) return;

    // User already has gov id creds. Send them to the confirm reverify page.
    if (sortedCreds?.[serverAddress['idgov-v2']]) {
      navigate('/issuance/idgov-confirm-reverify')
      return;
    }

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
      preferredProvider = countryToVerificationProvider[country] ?? 'veriff'
    }

    // Redirect the user to the issuance page that uses the correct IDV provider
    navigate(`/issuance/idgov-${preferredProvider}`)

  }, [sortedCreds, loadingCreds, countryIsLoading])

  return (
    <VerificationContainer steps={steps} currentIdx={0}>
      <div style={{ textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    </VerificationContainer>
  );
};

export default GovIDRedirect;
