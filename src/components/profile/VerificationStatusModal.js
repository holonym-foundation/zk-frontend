import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../atoms/Modal";
import useIdvSessionStatus from "../../hooks/useIdvSessionStatus"

function StatusesOverview({
  govIdRetrievalEndpoints,
  idvSessionStatus,
  onfidoStatus,
  handleViewReason,
}) {
  const navigate = useNavigate();

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', width: '33.33%' }}><p>Provider</p></div>
        <div style={{ fontWeight: 'bold', width: '33.33%' }}><p>Status</p></div>
        <div style={{ fontWeight: 'bold', width: '33.33%' }}><p>Action</p></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ width: '33.33%' }}><p>Veriff</p></div>
        <div style={{ width: '33.33%' }}>
          <p>
            {idvSessionStatus?.veriff?.status ?? 'n/a'}
          </p>
        </div>
        <div style={{ width: '33.33%' }}>
          {govIdRetrievalEndpoints?.veriff ? (
            <button 
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: '14px',
              }}
              onClick={() => navigate(`/issuance/idgov-veriff/store?retrievalEndpoint=${govIdRetrievalEndpoints?.veriff}`)}
            >
              Finish Verification
            </button>
          ) : idvSessionStatus?.veriff?.status && idvSessionStatus?.veriff?.status === 'declined' ? (
            <button 
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: '14px',
              }}
              onClick={() => {
                handleViewReason('Veriff', idvSessionStatus?.veriff?.failureReason)
              }}
            >
              View Reason
            </button>
          ) : (
            <button 
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: '14px',
              }}
              onClick={() => navigate('/issuance/idgov-veriff')}
              disabled={idvSessionStatus?.veriff?.status && idvSessionStatus?.veriff?.status !== 'approved'}
            >
              Verify
            </button>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ width: '33.33%' }}><p>iDenfy</p></div>
        <div style={{ width: '33.33%' }}><p>{idvSessionStatus?.idenfy?.status ?? 'n/a'}</p></div>
        <div style={{ width: '33.33%' }}>
          {govIdRetrievalEndpoints?.idenfy ? (
            <button 
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: '14px',
              }}
              onClick={() => navigate(`/issuance/idgov-idenfy/store?retrievalEndpoint=${govIdRetrievalEndpoints?.idenfy}`)}
            >
              Finish Verification
            </button>
          ) : idvSessionStatus?.idenfy?.status && idvSessionStatus?.idenfy?.status === 'DENIED' ? (
            <button 
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: '14px',
              }}
              onClick={() => {
                handleViewReason('iDenfy', idvSessionStatus?.idenfy?.failureReason ?? {})
              }}
            >
              View Reason
            </button>
          ) : (
            <button 
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: '14px',
              }}
              onClick={() => navigate('/issuance/idgov-idenfy')}
              disabled={idvSessionStatus?.idenfy?.status && idvSessionStatus?.idenfy?.status !== 'APPROVED'}
            >
              Verify
            </button>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ width: '33.33%' }}><p>Onfido</p></div>
        <div style={{ width: '33.33%' }}><p>{onfidoStatus ?? 'n/a'}</p></div>
        <div style={{ width: '33.33%' }}>
          {govIdRetrievalEndpoints?.onfido ? (
            <button 
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: '14px',
              }}
              onClick={() => navigate(`/issuance/idgov-onfido/store?retrievalEndpoint=${govIdRetrievalEndpoints?.onfido}`)}
            >
              Finish Verification
            </button>
          ) : idvSessionStatus?.onfido?.status && onfidoStatus === 'declined' ? (
            <button 
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: '14px',
              }}
              onClick={() => {
                handleViewReason('Onfido', idvSessionStatus?.onfido?.failureReason)
              }}
            >
              View Reason
            </button>
          ) : (
            <button 
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: '14px',
              }}
              onClick={() => navigate('/issuance/idgov-onfido')}
              disabled={idvSessionStatus?.onfido?.status && onfidoStatus !== 'complete'}
            >
              Verify
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function VerificationFailureReason({ provider, reason, handleClickBack }) {
  let reasonStr = '';

  if (typeof reason === 'string') {
    reasonStr = reason;
  } else if (Array.isArray(reason)) {
    reasonStr = reason.map((r, i) => <Fragment key={i}>{r}<br /></Fragment>);
  } else if (typeof reason === 'object') {
    reasonStr = Object.entries(reason)
      .filter(([_, value]) => 
        value !== undefined && value !== null && value !== '' && (value ?? []).length > 0
      )
      .map(([key, value], i) => (
        <Fragment key={i}>
          {key}: {Array.isArray(value) ? value.join(', ') : value}<br />
        </Fragment>
      ));
  }

  return (
    <>
      <p>Your verification with {provider} failed due to the following reasons.</p>
      <p style={{ color: 'red' }}>{reasonStr}</p>

      <div style={{ marginTop: '20px' }}>
        <button
          className="export-private-info-button"
          style={{
            lineHeight: "1",
            fontSize: "16px"
          }}
          onClick={handleClickBack}
        >
          Back
        </button>
      </div>
    </>
  )
}

export default function VerificationStatusModal({ isVisible, setIsVisible, govIdRetrievalEndpoints }) {
  const [page, setPage] = useState('overview') // 'overview' | 'reason'
  const [reasonProps, setReasonProps] = useState({})

  const { data: idvSessionStatus } = useIdvSessionStatus();

  // Onfido is slightly different since it separates status from result. To display
  // the failure "status" as a sinle string, we need to check both status and result.
  const onfidoStatus = 
    (idvSessionStatus?.onfido?.status === 'complete' && 
    idvSessionStatus?.onfido?.result === 'consider') 
      ? 'declined' : idvSessionStatus?.onfido?.status

  const handleViewReason = (provider, reason) => {
    setReasonProps({
      provider,
      reason
    })
    setPage('reason')
  }

  return (
    <>
      <Modal 
        visible={isVisible}
        setVisible={setIsVisible} 
        blur={true}
        heavyBlur={false}
        transparentBackground={false}
      >
        <div style={{ textAlign: 'center', margin: '20px' }}>
          <h2>Government ID Verification Status</h2>
          {page === 'overview' && (
            <StatusesOverview 
              govIdRetrievalEndpoints={govIdRetrievalEndpoints}
              idvSessionStatus={idvSessionStatus}
              onfidoStatus={onfidoStatus}
              handleViewReason={handleViewReason}
            />
          )}

          {page === 'reason' && (
            <VerificationFailureReason 
              provider={reasonProps.provider}
              reason={reasonProps.reason}
              handleClickBack={() => setPage('overview')}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
