import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import loadVouched from '../../../load-vouched';
import useIdvSessionStatus from "../../../hooks/useIdvSessionStatus"
import useIdenfyIDV from "../../../hooks/useIdenfyIDV"
import useOnfidoIDV from "../../../hooks/useOnfidoIDV"
import useVeriffIDV from "../../../hooks/useVeriffIDV"
import { 
  idServerUrl,
  countryToVerificationProvider,
  maxDailyVouchedJobCount
} from "../../../constants";
import { datadogLogs } from "@datadog/browser-logs";

const useSniffedCountry = () => {
  return useQuery({
    queryKey: ['sniffCountryUsingIp'],
    queryFn: async () => {
      const resp = await fetch('http://ip-api.com/json?fields=country')
      const data = await resp.json()
      return data.country
    },
    staleTime: Infinity,
  });
}

const StepIDV = () => {
  useEffect(() => {
    try {
      datadogLogs.logger.info("StartGovID", {});
      window.fathom.trackGoal('DCTNZBL9', 0)  
    } catch (err) {
      console.log(err);
    }
  }, []);

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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
  const { encodedRetrievalEndpoint: veriffRetrievalEndpoint } = useVeriffIDV({
    enabled: preferredProvider === 'veriff'
  })
  const {
    verificationUrl,
    canStart,
    encodedRetrievalEndpoint: idenfyRetrievalEndpoint
  } = useIdenfyIDV({
    enabled: preferredProvider === 'idenfy'
  })
  const { encodedRetrievalEndpoint: onfidoRetrievalEndpoint } = useOnfidoIDV({
    enabled: preferredProvider === 'onfido'
  })

  const [verificationError, setVerificationError] = useState();
  
  const idvSessionStatusQuery = useIdvSessionStatus({
    onSuccess: (data) => {
      if (!data) return;

      // See: https://developers.veriff.com/#verification-session-status-and-decision-codes
      const unsuccessfulVeriffStatuses = ['declined', 'resubmission_requested', 'abandoned', 'expired']
      // See: https://documentation.idenfy.com/API/IdentificationDataRetrieval#verification-status
      const unsuccessfulIdenfyStatuses = ['DENIED', 'SUSPECTED', 'EXPIRED', 'EXPIRED-DELETED', 'DELETED', 'ARCHIVED']
      // See: https://documentation.onfido.com/#check-status
      const unsuccessfulOnfidoStatuses = ['withdrawn', 'paused', 'reopened']

      if (preferredProvider === 'veriff' && data?.veriff?.status && veriffRetrievalEndpoint) {
        if (data?.veriff?.status === 'approved') {
          navigate(`/issuance/idgov/store?retrievalEndpoint=${veriffRetrievalEndpoint}`)
        } else if (unsuccessfulVeriffStatuses.includes(data?.veriff?.status)) {
          setVerificationError(
            `Status of Veriff session ${data?.veriff?.sessionId} is '${data?.veriff?.status}'. Expected 'approved'.`
          )
        } else {
          console.log(`Veriff status is '${data?.veriff?.status}'. Expected 'approved'.`)
        }
      } else if (data?.idenfy?.status && preferredProvider === 'idenfy' && idenfyRetrievalEndpoint) {
        if (data?.idenfy?.status === 'APPROVED') {
          navigate(`/issuance/idgov/store?retrievalEndpoint=${idenfyRetrievalEndpoint}`)
        } else if (unsuccessfulIdenfyStatuses.includes(data?.idenfy?.status)) {
          setVerificationError(
            `Status of iDenfy session ${data?.idenfy?.scanRef} is '${data?.idenfy?.status}'. Expected 'APPROVED'.`
          )
        } else {
          console.log(`Idenfy status is '${data?.idenfy?.status}'. Expected 'APPROVED'.`)
        }
      } else if (data?.onfido?.status && preferredProvider === 'onfido' && onfidoRetrievalEndpoint) {
        if (data?.onfido?.status === 'complete') {
          navigate(`/issuance/idgov/store?retrievalEndpoint=${onfidoRetrievalEndpoint}`)
        } else if (unsuccessfulOnfidoStatuses.includes(data?.onfido?.status)) {
          setVerificationError(
            `Status of Onfido check ${data?.onfido?.check_id} is '${data?.onfido?.status}'. Expected 'complete'.`
          )
        } else {
          console.log(`Onfido status is '${data?.onfido?.status}'. Expected 'complete'.`)
        }
      }
    },
  })

  // useEffect(() => {
  //   if (!phoneNumber) return;
  //   (async () => {
  //     try {
  //       const resp = await fetch(`${idServerUrl}/vouched/job-count`)
  //       const data = await resp.json();
  //       if (data.today >= maxDailyVouchedJobCount) {
  //         alert("Sorry, we cannot verify any more IDs at this time");
  //         return;
  //       }
  //       console.log('loading vouched QR code')
  //       loadVouched(phoneNumber);  
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   })();
  // }, [phoneNumber]);

  return (
    <>
      <h3 style={{marginBottom:"25px", marginTop: "-25px"}}>Verify your ID</h3>
      {/* <div id="vouched-element" style={{ height: "10vh" }} /> */}
      {preferredProvider === 'onfido' && (
        <div id="onfido-mount"></div>
      )}

      {preferredProvider === 'idenfy' && (
        <div style={{ textAlign: 'center' }}>
          <p>Verify your ID</p>
          <div style={{ 
            marginTop: '20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              className="export-private-info-button"
              style={{
                lineHeight: "1",
                fontSize: "16px"
              }}
              disabled={!canStart}
              onClick={() => {
                window.open(verificationUrl, '_blank');
              }}
            >
              Start Verification
            </button>
          </div>
        </div>
      )}

      {idvSessionStatusQuery?.data?.[preferredProvider]?.status && 
        !(preferredProvider === 'idenfy' && idvSessionStatusQuery?.data?.[preferredProvider]?.status === 'ACTIVE') && (
        <div style={{ textAlign: 'center' }}>
          <p>
            Verification status: {idvSessionStatusQuery?.data?.[preferredProvider]?.status}
          </p>
          <p>
            Once your verification is successful, you will be redirected to the next step. You
            can also see the status of your verification on your profile page.
          </p>
        </div>
      )}

      {verificationError && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'red' }}>{verificationError}</p>
          <p>
            Please try again or contact support if the problem persists.
          </p>
        </div>
      )}
    </>
  );
}

export default StepIDV;
