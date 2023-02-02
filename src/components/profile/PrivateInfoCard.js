import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import classNames from "classnames";
import { Oval } from "react-loader-spinner";
import { InfoButton } from "../info-button";
import { Modal } from "../atoms/Modal";
import ColoredHorizontalRule from "../atoms/ColoredHorizontalRule";
import { serverAddress } from "../../constants/misc";
import { useLitAuthSig } from "../../context/LitAuthSig";
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";

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
      <Modal visible={visible} setVisible={setVisible} blur={blur}>
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
  const [authSigs, setAuthSigs] = useState(null);
  const { litAuthSig } = useLitAuthSig();
  const { holoAuthSig } = useHoloAuthSig();
  const { holoKeyGenSig } = useHoloKeyGenSig();

  useEffect(() => {
    if (!litAuthSig || !holoAuthSig || !holoKeyGenSig) return;
    const authSigsTemp = JSON.stringify({ holoAuthSig, holoKeyGenSig, litAuthSig });
    setAuthSigs(authSigsTemp);
  }, [litAuthSig, holoAuthSig, holoKeyGenSig])

  const exportButtonClasses = classNames({
    "export-private-info-button": true,
    "disabled": !authSigs,
  });

  return (
    <>
      <ExportModal authSigs={authSigs} visible={exportModalVisible} setVisible={setExportModalVisible} />
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
                      text={`Data is stored locally and a backup is encrypted, split up, and stored in multiple locations access-gated by your wallet signature. Part of it is stored in the Lit protocol, and part of it is stored on a server that cannot read any of your data, since all your data is encrypted. This server may be replaced with decentralized storage. Nobody can see your data except you, even in the backups.`}
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
                ) : (
                  <>
                    <div className="private-info-attribute-name">Government ID</div>
                    <VerifyButton onClick={() => navigate('/mint/idgov')} text="Verify Government ID" />
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
                    <VerifyButton onClick={() => navigate('/mint/phone')} text="Verify Phone Number" />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
