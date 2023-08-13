import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import useIdvSessionStatus from "../../../../hooks/useIdvSessionStatus"
import useVeriffIDV from "../../../../hooks/useVeriffIDV"
import { 
  idServerUrl,
} from "../../../../constants";
import { datadogLogs } from "@datadog/browser-logs";

const StepIDVVeriff = () => {
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
  const { encodedRetrievalEndpoint: veriffRetrievalEndpoint } = useVeriffIDV({
    enabled: returningUserHasSuccessfulSession === 'no'
  })

  const [verificationError, setVerificationError] = useState();
  
  const idvSessionStatusQuery = useIdvSessionStatus('veriff', {
    onSuccess: (data) => {
      if (!data) return;

      // See: https://developers.veriff.com/#verification-session-status-and-decision-codes
      const unsuccessfulVeriffStatuses = ['declined', 'resubmission_requested', 'abandoned', 'expired']

      let hasSuccessfulSession = false;
      if (data?.veriff?.status) {
        if (veriffRetrievalEndpoint) {
          if (data?.veriff?.status === 'approved') {
            navigate(`/issuance/idgov-veriff/store?retrievalEndpoint=${veriffRetrievalEndpoint}`)
          } else if (unsuccessfulVeriffStatuses.includes(data?.veriff?.status)) {
            setVerificationError(
              `Status of Veriff session ${data?.veriff?.sessionId} is '${data?.veriff?.status}'. Expected 'approved'.`
            )
          } else {
            console.log(`Veriff status is '${data?.veriff?.status}'. Expected 'approved'.`)
          }
        } else {
          // If the user has a successful session but the retrieval endpoint isn't populated, then
          // they are a returning user who didn't complete the "finalize" step of issuance.
          if (data?.veriff?.status === 'approved') {
            hasSuccessfulSession = true;
            const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${data?.veriff?.sessionId}`
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
                  navigate(`/issuance/idgov-veriff/store?retrievalEndpoint=${retrievalEndpointForReturningUser}`)
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
          {idvSessionStatusQuery?.data?.['veriff']?.status && (
            <div style={{ textAlign: 'center' }}>
              <p>
                Verification status: {idvSessionStatusQuery?.data?.['veriff']?.status}
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

export default StepIDVVeriff;
