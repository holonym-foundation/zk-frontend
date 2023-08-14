import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query'
import { Modal } from "../atoms/Modal";
import useIdvSessionStatus from "../../hooks/useIdvSessionStatus"

export default function VerificationStatusModal({ isVisible, setIsVisible, govIdRetrievalEndpoints }) {
  const navigate = useNavigate();

  const { data: idvSessionStatus } = useIdvSessionStatus();

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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', width: '33.33%' }}><p>Provider</p></div>
            <div style={{ fontWeight: 'bold', width: '33.33%' }}><p>Status</p></div>
            <div style={{ fontWeight: 'bold', width: '33.33%' }}><p>Action</p></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ width: '33.33%' }}><p>Veriff</p></div>
            <div style={{ width: '33.33%' }}><p>{idvSessionStatus?.veriff?.status ?? 'n/a'}</p></div>
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
            <div style={{ width: '33.33%' }}><p>{idvSessionStatus?.onfido?.status ?? 'n/a'}</p></div>
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
              ) : (
                <button 
                  className="profile-navigate-to-verification-button"
                  style={{
                    fontSize: '14px',
                  }}
                  onClick={() => navigate('/issuance/idgov-onfido')}
                  disabled={idvSessionStatus?.onfido?.status && idvSessionStatus?.onfido?.status !== 'complete'}
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}