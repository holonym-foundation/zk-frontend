import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InfoButton } from "../info-button";
import ColoredHorizontalRule from "../atoms/ColoredHorizontalRule";
import { serverAddress } from "../../constants/misc";

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

const VerifyButton = ({ onClick, text }) => (
  <button onClick={onClick} className="profile-verify-button">
    {text}
  </button>
)

export default function PrivateInfoCard({ creds }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="profile-info-card">
        <div className="card-header">
          <h2 className="card-header-title">Private Info</h2>
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
                    <div className="private-info-attribute-date-issued">{creds[credName]?.completedAt}</div>
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
                <div className="private-info-attribute-date-issued">{creds?.['Phone Number']?.completedAt}</div>
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
      </div>
  </>
  );
}
