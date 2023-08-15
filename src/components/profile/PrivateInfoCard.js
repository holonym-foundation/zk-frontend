import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import classNames from "classnames";
import { Oval } from "react-loader-spinner";
import { useQuery } from '@tanstack/react-query'
import { InfoButton } from "../info-button";
import { Modal } from "../atoms/Modal";
import ColoredHorizontalRule from "../atoms/ColoredHorizontalRule";
import { serverAddress, idServerUrl } from "../../constants";
import useIdvSessionStatus from "../../hooks/useIdvSessionStatus"
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";
import VerificationStatusModal from './VerificationStatusModal';

const issuerAddrToName = Object.fromEntries(
  Object.values(serverAddress).map(addr => [addr, "Holonym"])
);

const govIdCredNames = [
  "First Name",
  "Middle Name",
  "Last Name",
  "Birthdate",
  "Street Number",
  "Street Name",
  "Street Unit",
  "City",
  "Subdivision",
  "Zip Code",
  "Country",
]

const medicalCredNames = [
  'Medical Credentials',
  'Medical Specialty',
  // 'License',
  'NPI Number',
]


const ExportModal = ({ authSigs, visible, setVisible, blur = true, }) => {
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    if (showCopied) {
      const timer = setTimeout(() => {
        setShowCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCopied]);

  return (
    <>
      <Modal visible={visible} setVisible={setVisible} blur={blur} heavyBlur={true} transparentBackground={true}>
        <div style={{ textAlign: 'center' }}>
          <h3>Export Your Holo</h3>
          <p>Export your private info to the Holonym mobile app.</p>
          <p>Copy to clipboard or scan QR code.</p>
          <hr />
          <h4>Copy to clipboard</h4>
          <button 
            className="x-button secondary outline"
            onClick={() => {
              navigator.clipboard.writeText(authSigs);
              setShowCopied(true)
            }}
          >
            {showCopied ? "\u2713 Copied" : "Copy"}
          </button>
          <hr />
          <h4>Scan QR code</h4>
          <div style={{ margin: "20px" }}>
            <QRCode value={authSigs || ""} />
          </div>
        </div>
      </Modal>
    </>
  )
}

const VerifyButton = ({ onClick, text }) => (
  <button onClick={onClick} className="profile-verify-button">
    {text}
  </button>
)

export default function PrivateInfoCard({ creds, loading }) {
  const navigate = useNavigate();
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [statusModalIsVisible, setStatusModalIsVisible] = useState(false)
  const [authSigs, setAuthSigs] = useState(null);
  const { holoAuthSig } = useHoloAuthSig();
  const { holoKeyGenSig } = useHoloKeyGenSig();

  useEffect(() => {
    if (!(holoAuthSig && holoKeyGenSig)) return;
    const authSigsTemp = JSON.stringify({ holoAuthSig, holoKeyGenSig });
    setAuthSigs(authSigsTemp);
  }, [holoAuthSig, holoKeyGenSig])

  const exportButtonClasses = classNames({
    "export-private-info-button": true,
    "disabled": !authSigs,
  });

  const { data: idvSessionStatus } = useIdvSessionStatus();
  
  const govIdRetrievalEndpoints = useMemo(() => {
    const endpoints = {}
    if (idvSessionStatus?.veriff?.status === 'approved') {
      const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${
        idvSessionStatus?.veriff?.sessionId
      }`
      endpoints.veriff = encodeURIComponent(window.btoa(retrievalEndpoint))
    }
    if (idvSessionStatus?.idenfy?.status === 'APPROVED') {
      const retrievalEndpoint = `${idServerUrl}/idenfy/credentials?scanRef=${
        idvSessionStatus?.idenfy?.scanRef
      }`
      endpoints.idenfy = encodeURIComponent(window.btoa(retrievalEndpoint))
    }
    if (idvSessionStatus?.onfido?.status === 'complete' && idvSessionStatus?.onfido?.result === 'clear') {
      const retrievalEndpoint = `${idServerUrl}/onfido/credentials?check_id=${
        idvSessionStatus?.onfido?.check_id
      }`
      endpoints.onfido = encodeURIComponent(window.btoa(retrievalEndpoint))
    }
    return endpoints
  }, [idvSessionStatus])

  const govIdRetrievalEndpoint = useMemo(() => {
    if (Object.keys(govIdRetrievalEndpoints).length === 1) {
      return Object.values(govIdRetrievalEndpoints)[0]
    }
  }, [govIdRetrievalEndpoints])

  // Regarding UX of verification session statuses...
  // - If they have 1 successful session and no other session, simply display a link
  //   to finalize verification.
  // - Otherwise, let them open a modal to view verification statuses for each provider.

  return (
    <>
      <ExportModal authSigs={authSigs} visible={exportModalVisible} setVisible={setExportModalVisible} />
      
      <VerificationStatusModal 
        isVisible={statusModalIsVisible} 
        setIsVisible={setStatusModalIsVisible}
        govIdRetrievalEndpoints={govIdRetrievalEndpoints}
      />

      <div className="profile-info-card">
        {loading ? (
          <Oval
            // height={100}
            // width={100}
            color="white"
            wrapperStyle={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#060612" // matches card background
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        ) : (
          <>
            <div className="card-header" style={{ display: "flex"}}>
              <div>
                <h2 className="card-header-title">Your Holo</h2>
                <div style={{ display: 'flex' }}>
                  <p>This is kept locally and privately. Only you can see it.</p>
                  <div style={{ marginBottom: "12px", position: 'relative', top: '-4px', left: '-4px' }}>
                    <InfoButton
                      type="inPlace"
                      text={"Data is stored locally and a backup is encrypted and stored in a backup server access-gated by your wallet signature. This server may be replaced with decentralized storage. Nobody can see your data except you."}
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button 
                  className={exportButtonClasses}
                  style={{ padding: "20px" }} 
                  onClick={() => authSigs ? setExportModalVisible(true) : null}
                >
                  Export
                </button>
              </div>
            </div>
            <ColoredHorizontalRule />
            <div className="card-content">
              <div className="private-info-grid">
                <div style={{ fontWeight: 'bold' }} className="private-info-attribute-name">Attribute</div>
                <div style={{ fontWeight: 'bold' }} className="private-info-attribute-value">Value</div>
                <div style={{ fontWeight: 'bold' }} className="private-info-attribute-date-issued">Date issued</div>
                <div style={{ fontWeight: 'bold' }} className="private-info-attribute-issuer">Issuer</div>

                {creds && Object.keys(creds).filter(item => govIdCredNames.includes(item)).length > 0 ? (
                  Object.keys(creds).filter(item => govIdCredNames.includes(item)).map((credName, index) => 
                  // TODO: Fix: Warning: Each child in a list should have a unique "key" prop.
                    (
                      <>
                        <div className="private-info-attribute-name">{credName}</div>
                        <div className="private-info-attribute-value">{creds[credName]?.cred}</div>
                        <div className="private-info-attribute-date-issued">{creds[credName]?.iat}</div>
                        <div className="private-info-attribute-issuer">{issuerAddrToName[creds[credName]?.issuer] ?? creds[credName]?.issuer}</div>
                      </>
                    )
                  )
                ) : govIdRetrievalEndpoint ? (
                  <>
                    <div className="private-info-attribute-name">Government ID</div>
                    <VerifyButton 
                      onClick={() => navigate(`/issuance/idgov-veriff/store?retrievalEndpoint=${govIdRetrievalEndpoint}`)} 
                      text="Your Government ID credentials are ready - Click here to complete issuance" 
                    />
                  </>
                ) : idvSessionStatus?.veriff?.status || idvSessionStatus?.idenfy?.status || idvSessionStatus?.onfido?.status ? (
                  <>
                    <div className="private-info-attribute-name">Government ID</div>
                    <VerifyButton onClick={() => setStatusModalIsVisible(true)} text="View Government ID Verification Status" />
                  </>
                ) : (
                  <>
                    <div className="private-info-attribute-name">Government ID</div>
                    <VerifyButton onClick={() => navigate('/issuance/idgov')} text="Verify Government ID" />
                  </>
                )}
                
                {creds?.['Phone Number'] ? (
                  <>
                    <div className="private-info-attribute-name">Phone Number</div>
                    <div className="private-info-attribute-value">{creds['Phone Number']?.cred}</div>
                    <div className="private-info-attribute-date-issued">{creds?.['Phone Number']?.iat}</div>
                    <div className="private-info-attribute-issuer">{issuerAddrToName[creds?.['Phone Number']?.issuer] ?? creds?.['Phone Number']?.issuer}</div>
                  </>
                ) : (
                  <>
                    <div className="private-info-attribute-name">Phone Number</div>
                    <VerifyButton onClick={() => navigate('/issuance/phone')} text="Verify Phone Number" />
                  </>
                )}

                {creds && Object.keys(creds).filter(item => medicalCredNames.includes(item)).length > 0 ? (
                  Object.keys(creds).filter(item => medicalCredNames.includes(item)).map((credName, index) => 
                  // TODO: Fix: Warning: Each child in a list should have a unique "key" prop.
                    (
                      <>
                        <div className="private-info-attribute-name">{credName}</div>
                        <div className="private-info-attribute-value">{creds[credName]?.cred}</div>
                        <div className="private-info-attribute-date-issued">{creds[credName]?.iat}</div>
                        <div className="private-info-attribute-issuer">{issuerAddrToName[creds[credName]?.issuer] ?? creds[credName]?.issuer}</div>
                      </>
                    )
                  )
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
