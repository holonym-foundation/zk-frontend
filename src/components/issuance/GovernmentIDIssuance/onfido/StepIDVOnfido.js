import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import useIdvSessionStatus from "../../../../hooks/useIdvSessionStatus"
import useOnfidoIDV from "../../../../hooks/useOnfidoIDV"
import { 
  idServerUrl,
} from "../../../../constants";
import { datadogLogs } from "@datadog/browser-logs";

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
  const [returningUserHasSuccessfulSession, setReturningUserHasSuccessfulSession] = useState('loading'); // 'loading' | 'yes' | 'no'
  const [retrievalEndpointForReturningUser, setRetrievalEndpointForReturningUser] = useState();
  const { encodedRetrievalEndpoint: onfidoRetrievalEndpoint } = useOnfidoIDV({
    enabled: returningUserHasSuccessfulSession === 'no'
  })

  const [verificationError, setVerificationError] = useState();
  
  const idvSessionStatusQuery = useIdvSessionStatus('onfido', {
    onSuccess: (data) => {
      if (!data) return;

      // See: https://documentation.onfido.com/#check-status
      const unsuccessfulOnfidoStatuses = ['withdrawn', 'paused', 'reopened']

      let hasSuccessfulSession = false;
      if (data?.onfido?.status) {
        if (onfidoRetrievalEndpoint) {
          if (data?.onfido?.status === 'complete') {
            navigate(`/issuance/idgov-onfido/store?retrievalEndpoint=${onfidoRetrievalEndpoint}`)
          } else if (unsuccessfulOnfidoStatuses.includes(data?.onfido?.status)) {
            setVerificationError(
              `Status of Onfido check ${data?.onfido?.check_id} is '${data?.onfido?.status}'. Expected 'complete'.`
            )
          } else {
            console.log(`Onfido status is '${data?.onfido?.status}'. Expected 'complete'.`)
          }
        } else {
          // If the user has a successful session but the retrieval endpoint isn't populated, then
          // they are a returning user who didn't complete the "finalize" step of issuance.
          if (data?.veriff?.status === 'approved') {
            hasSuccessfulSession = true;
            const retrievalEndpoint = `${idServerUrl}/idenfy/credentials?scanRef=${data?.idenfy?.scanRef}`
            const encodedRetrievalEndpoint = encodeURIComponent(window.btoa(retrievalEndpoint))
            setRetrievalEndpointForReturningUser(encodedRetrievalEndpoint)
          }
        }
      }

      setReturningUserHasSuccessfulSession(hasSuccessfulSession ? 'yes' : 'no');
    },
  })

  return (
    <>
      <h3 style={{marginBottom:"25px", marginTop: "-25px"}}>Verify your ID</h3>
      {returningUserHasSuccessfulSession === 'yes' && (
        <>
          <div style={{ textAlign: 'center' }}>
            <p>It looks like you already verified yourself.</p>
            <p>Click continue to finalize verification.</p>
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
                onClick={() => {
                  navigate(`/issuance/idgov-onfido/store?retrievalEndpoint=${retrievalEndpointForReturningUser}`)
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {returningUserHasSuccessfulSession !== 'yes' && (
        <>
          <div id="onfido-mount"></div>

          {idvSessionStatusQuery?.data?.onfido?.status && (
            <div style={{ textAlign: 'center' }}>
              <p>
                Verification status: {idvSessionStatusQuery?.data?.onfido?.status}
              </p>
              <p>
                Once your verification is successful, you will be redirected to the next step.
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
      )}
    </>
  );
}

export default StepIDV;
