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
        <div style={{ textAlign: 'center' }}>
          <h2>Government ID Verification Status</h2>        
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold' }}><p>Provider</p></div>
            <div style={{ fontWeight: 'bold' }}><p>Status</p></div>
            <div style={{ fontWeight: 'bold' }}><p>Action</p></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div><p>Veriff</p></div>
            <div><p>{idvSessionStatus?.veriff?.status ?? 'n/a'}</p></div>
            <div>
              {govIdRetrievalEndpoints?.veriff ? (
                <button 
                  className="confirmation-modal-button-confirm"
                  onClick={() => navigate(`/issuance/idgov-veriff/${govIdRetrievalEndpoints?.veriff}`)}
                >
                  Finish Verification
                </button>
              ) : (
                <button 
                  className="confirmation-modal-button-confirm"
                  onClick={() => navigate('/issuance/idgov-veriff')}
                  disabled={idvSessionStatus?.veriff?.status && idvSessionStatus?.veriff?.status !== 'approved'}
                >
                  Verify
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div><p>iDenfy</p></div>
            <div><p>{idvSessionStatus?.idenfy?.status ?? 'n/a'}</p></div>
            <div>
              {govIdRetrievalEndpoints?.idenfy ? (
                <button 
                  className="confirmation-modal-button-confirm"
                  onClick={() => navigate(`/issuance/idgov-idenfy/${govIdRetrievalEndpoints?.idenfy}`)}
                >
                  Finish Verification
                </button>
              ) : (
                <button 
                  className="confirmation-modal-button-confirm"
                  onClick={() => navigate('/issuance/idgov-idenfy')}
                  disabled={idvSessionStatus?.idenfy?.status && idvSessionStatus?.idenfy?.status !== 'APPROVED'}
                >
                  Verify
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div><p>Onfido</p></div>
            <div><p>{idvSessionStatus?.onfido?.status ?? 'n/a'}</p></div>
            <div>
              {govIdRetrievalEndpoints?.onfido ? (
                <button 
                  className="confirmation-modal-button-confirm"
                  onClick={() => navigate(`/issuance/idgov-onfido/${govIdRetrievalEndpoints?.onfido}`)}
                >
                  Finish Verification
                </button>
              ) : (
                <button 
                  className="confirmation-modal-button-confirm"
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
