import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import useIdvSessionStatus from "../../../../hooks/useIdvSessionStatus"
import useIdenfyIDV from "../../../../hooks/useIdenfyIDV"
import { 
  idServerUrl,
} from "../../../../constants";
import { datadogLogs } from "@datadog/browser-logs";

const StepIDVIdenfy = () => {
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
  const {
    verificationUrl,
    canStart,
    encodedRetrievalEndpoint: idenfyRetrievalEndpoint
  } = useIdenfyIDV({
    enabled: returningUserHasSuccessfulSession === 'no'
  })

  const [verificationError, setVerificationError] = useState();
  
  const idvSessionStatusQuery = useIdvSessionStatus('idenfy', {
    onSuccess: (data) => {
      if (!data) return;

      // See: https://documentation.idenfy.com/API/IdentificationDataRetrieval#verification-status
      const unsuccessfulIdenfyStatuses = ['DENIED', 'SUSPECTED', 'EXPIRED', 'EXPIRED-DELETED', 'DELETED', 'ARCHIVED']

      let hasSuccessfulSession = false;
      if (data?.idenfy?.status) {
        if (idenfyRetrievalEndpoint) {
          if (data?.idenfy?.status === 'APPROVED') {
            navigate(`/issuance/idgov-veriff/store?retrievalEndpoint=${idenfyRetrievalEndpoint}`)
          } else if (unsuccessfulIdenfyStatuses.includes(data?.idenfy?.status)) {
            setVerificationError(
              `Status of iDenfy session ${data?.idenfy?.scanRef} is '${data?.idenfy?.status}'. Expected 'APPROVED'.`
            )
          } else {
            console.log(`Idenfy status is '${data?.idenfy?.status}'. Expected 'APPROVED'.`)
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
                  navigate(`/issuance/idgov-idenfy/store?retrievalEndpoint=${retrievalEndpointForReturningUser}`)
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

          {idvSessionStatusQuery?.data?.idenfy?.status && 
            !(idvSessionStatusQuery?.data?.idenfy?.status === 'ACTIVE') && (
            <div style={{ textAlign: 'center' }}>
              <p>
                Verification status: {idvSessionStatusQuery?.data?.idenfy?.status}
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
      )}
    </>
  );
}

export default StepIDVIdenfy;
