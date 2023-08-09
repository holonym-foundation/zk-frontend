import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createVeriffFrame, MESSAGES } from '@veriff/incontext-sdk';
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  init as initOnfido
} from 'onfido-sdk-ui'
// import 'onfido-sdk-ui/split/css'
import loadVouched from '../../load-vouched';
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import FinalStep from "./FinalStep";
import StepSuccess from "./StepSuccess";
import { 
  idServerUrl,
  countryToVerificationProvider,
  maxDailyVouchedJobCount
} from "../../constants";
import VerificationContainer from "./IssuanceContainer";
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

const useOnfidoIDV = ({ enabled }) => {
  const queryClient = useQueryClient();
  const [encodedRetrievalEndpoint, setEncodedRetrievalEndpoint] = useState();

  const { holoAuthSigDigest } = useHoloAuthSig();

  const { data: applicant } = useQuery({
    queryKey: ['onfidoApplicant'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/onfido/applicant`, {
        method: "POST",
      })
      return await resp.json()
    },
    staleTime: Infinity,
    enabled: enabled,
  })

  const { data: check, refetch: refetchCheck } = useQuery({
    queryKey: ['onfidoCheck'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/onfido/v2/check`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicant_id: applicant.applicant_id,
          sigDigest: holoAuthSigDigest,
        })
      })
      return await resp.json()
    },
    onSuccess: (data) => {
      // Navigate to retrievalEndpoint when user is approved
      const retrievalEndpoint = `${idServerUrl}/onfido/credentials?check_id=${data.id}`
      const encodedRetrievalEndpointTemp = encodeURIComponent(window.btoa(retrievalEndpoint))
      setEncodedRetrievalEndpoint(encodedRetrievalEndpointTemp)

      queryClient.invalidateQueries({ queryKey: ['idvSessionStatus'] })
    },
    enabled: false,
  })

  const { data: onfidoOut } = useQuery({
    queryKey: ['initOnfido'],
    queryFn: async () => {
      let onfido = {};

      // NOTE: Must call `await onfidoOut.safeTearDown()` when done, if you want to
      // re-initialize the SDK.

      onfido = initOnfido({
        token: applicant.sdk_token,
        containerId: 'onfido-mount',
        // containerEl: <div id="root" />, // ALTERNATIVE to `containerId`
        useModal: true,
        isModalOpen: true,
        smsNumberCountryCode: 'US', // TODO: Take user input for this
        // TODO: Low priority feature for improved UX: If the user already has phone
        // number creds, specify those here so that they don't have to re-enter their
        // phone number.
        // userDetails: {
        //   smsNumber: '+447500123456'
        // },
        // steps: [
        //   'welcome',
        //   'document',
        //   'face',
        //   'complete'
        // ],
        onComplete: (data) => {
          console.log('onfido: everything is complete. data:', data)
          onfido.setOptions({ isModalOpen: false })
          refetchCheck()
        },
        onError: (error) => {
          console.log('onfido: error', error)
        },
        onUserExit: (userExitCode) => {
          console.log('onfido: user exited', userExitCode)
        },
        onModalRequestClose: () => {
          console.log('onfido: modal closed')
          onfido.setOptions({ isModalOpen: false })
        }
      })

      return onfido
    },
    staleTime: Infinity,
    enabled: enabled && !!applicant?.sdk_token
  })

  return {
    encodedRetrievalEndpoint
  }
}

const useVeriffIDV = ({ enabled }) => {
  const queryClient = useQueryClient();
  const [encodedRetrievalEndpoint, setEncodedRetrievalEndpoint] = useState();

  const { holoAuthSigDigest } = useHoloAuthSig();

  const veriffSessionQuery = useQuery({
    queryKey: ['veriffSession'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/veriff/v2/session`, {
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
    enabled: enabled
  });

  useEffect(() => {
    if (!veriffSessionQuery.data?.url || !enabled) return;
    const verification = veriffSessionQuery.data;
    const handleVeriffEvent = (msg) => {
      if (msg === MESSAGES.FINISHED) {
        const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${verification.id}`
        const encodedRetrievalEndpointTemp = encodeURIComponent(window.btoa(retrievalEndpoint))
        setEncodedRetrievalEndpoint(encodedRetrievalEndpointTemp)

        queryClient.invalidateQueries({ queryKey: ['idvSessionStatus'] })
      }
    }
    createVeriffFrame({
      url: verification.url,
      onEvent: handleVeriffEvent
    });
  }, [veriffSessionQuery])

  return {
    encodedRetrievalEndpoint,
  }
}

// TODO: !!!!! WE STILL NEED TO TEST IDENFY !!!!! Can't test right now. iDenfy API returns 'Action 
// not allowed due to lack of funds or exceeded limit.'
const useIdenfyIDV = ({ enabled }) => {
  const queryClient = useQueryClient();
  const [encodedRetrievalEndpoint, setEncodedRetrievalEndpoint] = useState();

  const { holoAuthSigDigest } = useHoloAuthSig();

  const idenfySessionCreationQuery = useQuery({
    queryKey: ['idenfySessionCreation'],
    queryFn: async () => {
      const resp = await fetch(`${idServerUrl}/idenfy/v2/session`, {
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
  
  const idenfySessionStatusQuery = useQuery({
    queryKey: ['idenfySessionStatus'],
    queryFn: async () => {
      const scanRef = idenfySessionCreationQuery.data.scanRef
      const resp = await fetch(`${idServerUrl}/idenfy/verification-status?scanRef=${scanRef}`)
      return await resp.json()
    },
    onSuccess: (data) => {
      if (data?.status === 'APPROVED') {
        // Navigate to retrievalEndpoint when user is approved
        const retrievalEndpoint = `${idServerUrl}/idenfy/credentials?scanRef=${data.scanRef}`
        const encodedRetrievalEndpointTemp = encodeURIComponent(window.btoa(retrievalEndpoint))
        setEncodedRetrievalEndpoint(encodedRetrievalEndpointTemp)

        queryClient.invalidateQueries({ queryKey: ['idvSessionStatus'] })
      }
      // TODO: Display error if status isn't approved
    },
    enabled: !!idenfySessionCreationQuery?.data?.scanRef && enabled,
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  })

  return {
    canStart: !!idenfySessionCreationQuery.data?.scanRef,
    verificationStatus: idenfySessionStatusQuery.data?.status,
    verificationUrl: idenfySessionCreationQuery.data?.url,
    encodedRetrievalEndpoint,
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
    verificationStatus,
    encodedRetrievalEndpoint: idenfyRetrievalEndpoint
  } = useIdenfyIDV({
    enabled: preferredProvider === 'idenfy'
  })
  const { encodedRetrievalEndpoint: onfidoRetrievalEndpoint } = useOnfidoIDV({
    enabled: preferredProvider === 'onfido'
  })

  const { holoAuthSigDigest } = useHoloAuthSig();

  const [verificationError, setVerificationError] = useState();
  
  const idvSessionStatusQuery = useQuery({
    queryKey: ['idvSessionStatus'],
    queryFn: async () => {
      const resp = await fetch(`
        ${idServerUrl}/session-status?sigDigest=${holoAuthSigDigest}`
      );
      return await resp.json()
    },
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
    refetchInterval: 5000,
  });

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
          {verificationStatus && verificationStatus !== 'ACTIVE' && (
            <div>
              <p>Verification status: {verificationStatus}</p>
            </div>
          )}
        </div>
      )}

      {idvSessionStatusQuery?.data?.[preferredProvider]?.status && (
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
