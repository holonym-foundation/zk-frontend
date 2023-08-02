import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createVeriffFrame, MESSAGES } from '@veriff/incontext-sdk';
import { useQuery } from '@tanstack/react-query'
import loadVouched from '../../load-vouched';
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import FinalStep from "./FinalStep";
import StepSuccess from "./StepSuccess";
import { idServerUrl, maxDailyVouchedJobCount } from "../../constants";
import VerificationContainer from "./IssuanceContainer";
import { datadogLogs } from "@datadog/browser-logs";

const useVeriffIDV = ({ enabled }) => {
  const navigate = useNavigate();
  const veriffSessionQuery = useQuery({
    queryKey: ['veriffSession'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/veriff/session`, {
        method: "POST",
      })
      return await resp.json()
    },
    staleTime: Infinity,
    enabled: enabled
  });

  useEffect(() => {
    if (!veriffSessionQuery.data?.url || !enabled) return;
    const verification = veriffSessionQuery.data;
    const handleVeriffEvent = (msg) => {
      if (msg === MESSAGES.FINISHED) {
        const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${verification.id}`
        const encodedRetrievalEndpoint = encodeURIComponent(window.btoa(retrievalEndpoint))
        navigate(`/issuance/idgov/store?retrievalEndpoint=${encodedRetrievalEndpoint}`)
      }
    }
    createVeriffFrame({
      url: verification.url,
      onEvent: handleVeriffEvent
    });
  }, [veriffSessionQuery])

  return {}
}

const useIdenfyIDV = ({ enabled }) => {
  const navigate = useNavigate();
  const { holoAuthSigDigest } = useHoloAuthSig();
  const [retrievalEndpoint, setRetrievalEndpoint] = useState('');

  const idenfySessionQuery = useQuery({
    queryKey: ['idenfySession'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/idenfy/session`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sigDigest: holoAuthSigDigest
        })
      })
      return await resp.json()
    },
    staleTime: Infinity,
    enabled: holoAuthSigDigest && enabled
  });

  useEffect(() => {
    if (!idenfySessionQuery.data?.url) return;
    const verification = idenfySessionQuery.data;
    // Open verification.url in new tab
    // window.open(verification.url, '_blank');

    // When user clicks button, navigate to retrievalEndpoint
    // TODO: Instead of waiting for user to click button, poll id-server for verification status
    const retrievalEndpoint = `${idServerUrl}/idenfy/credentials?scanRef=${verification.scanRef}`
    const encodedRetrievalEndpoint = encodeURIComponent(window.btoa(retrievalEndpoint))
    // navigate(`/issuance/idgov/store?retrievalEndpoint=${encodedRetrievalEndpoint}`)
    setRetrievalEndpoint(encodedRetrievalEndpoint);
  }, [idenfySessionQuery])

  return {
    verificationUrl: idenfySessionQuery.data?.url,
    retrievalEndpoint
  }
}

const StepSuccessWithAnalytics = () => {
  useEffect(() => {
    try {
      datadogLogs.logger.info("SuccGovID", {});
      window.fathom.trackGoal('MTH0I1KJ', -1.38);  
    } catch (err) {
      console.log(err)
    }
  }, []);
  return <StepSuccess />
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

  const navigate = useNavigate();
  const preferredProvider = 'idenfy' // TODO: Make this a function of IP address location
  useVeriffIDV({
    // TODO: Make enabled dependent on IP address location
    enabled: false
  })
  const { verificationUrl, retrievalEndpoint } = useIdenfyIDV({
    // TODO: Make enabled dependent on IP address location
    enabled: true
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
              disabled={!retrievalEndpoint}
              onClick={() => {
                window.open(verificationUrl, '_blank');
              }}
            >
              Start Verification
            </button>
          </div>
          <p>Click continue once you are verified</p>
          <div style={{ 
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              className="export-private-info-button"
              style={{
                lineHeight: "1",
                fontSize: "16px"
              }}
              disabled={!retrievalEndpoint}
              onClick={() => {
                navigate(`/issuance/idgov/store?retrievalEndpoint=${retrievalEndpoint}`)
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const ConfirmRetry = ({ setRetry }) => (
  <div style={{ textAlign: 'center' }}>
    <h2>Skip verification?</h2>
    <p>We noticed you have verified yourself already.</p>
    <p>Would you like to skip to the Store step?</p>
    <div style={{ display: 'flex', flex: 'flex-row', marginTop: '20px' }}>
      <button
        className="export-private-info-button"
        style={{
          lineHeight: "1",
          fontSize: "16px"
        }}
        onClick={() => setRetry(false)}
      >
        No, I want to verify again
      </button>
      <div style={{ margin: '10px' }} />
      <button
        className="x-button"
        style={{
          lineHeight: "1",
          fontSize: "16px"
        }}
        onClick={() => {
          const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${localStorage.getItem('veriff-sessionId')}`
          const encodedRetrievalEndpoint = encodeURIComponent(window.btoa(retrievalEndpoint))
          window.location.href=(`/issuance/idgov/store?retrievalEndpoint=${encodedRetrievalEndpoint}`);
        }}
      >
        Yes
      </button>
    </div>
  </div>
)
const steps = ["Verify", "Finalize"];

function useGovernmentIDIssuanceState() {
  const { store } = useParams();
  const [success, setSuccess] = useState();
  const [retry, setRetry] = useState(!!localStorage.getItem('veriff-sessionId'));
  const [currentIdx, setCurrentIdx] = useState(0);


  const currentStep = useMemo(() => {
    if (!store) return "Verify";
    if (store) return "Finalize";
  }, [store]);

  useEffect(() => {
    setCurrentIdx(steps.indexOf(currentStep));
  }, [currentStep])

  return {
    success,
    setSuccess,
    retry,
    setRetry,
    currentIdx,
    setCurrentIdx,
    steps,
    currentStep,
  };
}

const GovernmentIDIssuance = () => {
  const navigate = useNavigate();
  const {
    success,
    setSuccess,
    retry,
    setRetry,
    currentIdx,
    steps,
    currentStep,
  } = useGovernmentIDIssuanceState();

  useEffect(() => {
    if (success && window.localStorage.getItem('register-credentialType')) {
			navigate(`/register?credentialType=${window.localStorage.getItem('register-credentialType')}&proofType=${window.localStorage.getItem('register-proofType')}&callback=${window.localStorage.getItem('register-callback')}`)
    }
  }, [navigate, success]);

  return (
    <VerificationContainer steps={steps} currentIdx={currentIdx}>
      { success ? (
        <StepSuccessWithAnalytics />
      ) : retry && currentStep !== "Finalize" ? (
        <ConfirmRetry setRetry={setRetry} />
      ) : currentStep === "Verify" ? (
        <StepIDV />
      ) : ( // currentStep === "Finalize" ? (
        <FinalStep onSuccess={() => setSuccess(true)} />
      )}
    </VerificationContainer>
  );
};

export default GovernmentIDIssuance;
