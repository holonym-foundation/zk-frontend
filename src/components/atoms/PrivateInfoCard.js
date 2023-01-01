import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InfoButton } from "../info-button";
import { serverAddress } from "../../constants/misc";

const issuerAddrToName = Object.fromEntries(
  Object.values(serverAddress).map(addr => [addr, "Holonym"])
);

export default function PrivateInfoCard({ creds }) {
  const navigate = useNavigate();

  return (
    <>
      {/* TODO: On small screens, just display attribute value (and have an accordian-style dropdown that displays the other columns) */}
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
        <div style={{ 
          margin: '10px', 
          padding: 'px', 
          border: 0, 
          height: "2px", 
          backgroundImage: "linear-gradient(to right, #5e72eb, transparent)" 
        }}></div>
        <div className="card-content">
          <div className="private-info-grid">
            <div style={{ fontWeight: 'bold' }}className="private-info-attribute-name">Attribute</div>
            <div style={{ fontWeight: 'bold' }}className="private-info-attribute-value">Value</div>
            <div style={{ fontWeight: 'bold' }}className="private-info-attribute-date-issued">Date issued</div>
            <div style={{ fontWeight: 'bold' }}className="private-info-attribute-issuer">Issuer</div>

            {creds?.['Country'] && creds?.['Subdivision'] && creds?.['Birthdate'] ? (
              <>
                <div className="private-info-attribute-name">Name</div>
                <div className="private-info-attribute-value">{
                  ((creds?.['First Name']?.cred ? creds['First Name']?.cred + " " : "") +
                  (creds?.['Middle Name']?.cred ? creds['Middle Name']?.cred + " " : "") +
                  (creds?.['Last Name']?.cred ? creds['Last Name']?.cred : ""))
                  || undefined
                }</div>
                <div className="private-info-attribute-date-issued">{
                  creds?.['First Name']?.completedAt ?? creds?.['Middle Name']?.completedAt ?? creds?.['Last Name']?.completedAt
                }</div>
                <div className="private-info-attribute-issuer">{
                  issuerAddrToName[creds?.['First Name']?.issuer] ?? issuerAddrToName[creds?.['Middle Name']?.issuer] ?? issuerAddrToName[creds?.['Last Name']?.issuer]
                }</div>
                
                <div className="private-info-attribute-name">Birthdate</div>
                <div className="private-info-attribute-value">{creds?.['Birthdate']?.cred}</div>
                <div className="private-info-attribute-date-issued">{creds?.['Birthdate']?.completedAt}</div>
                <div className="private-info-attribute-issuer">{issuerAddrToName[creds?.['Birthdate']?.issuer]}</div>

                <div className="private-info-attribute-name">Street address</div>
                <div className="private-info-attribute-value">{
                  ((creds?.['Street Number']?.cred ? creds['Street Number']?.cred + " " : "") +
                  (creds?.['Street Name']?.cred ? creds['Street Name']?.cred + " " : "") +
                  (creds?.['Street Unit']?.cred ? creds['Street Unit']?.cred : ""))
                  || undefined
                }</div>
                <div className="private-info-attribute-date-issued">{
                  creds?.['Street Number']?.completedAt ?? creds?.['Street Name']?.completedAt ?? creds?.['Street Unit']?.completedAt
                }</div>
                <div className="private-info-attribute-issuer">{
                  issuerAddrToName[creds?.['Street Number']?.issuer] ?? issuerAddrToName[creds?.['Street Name']?.issuer] ?? issuerAddrToName[creds?.['Street Unit']?.issuer]
                }</div>
                
                <div className="private-info-attribute-name">City</div>
                <div className="private-info-attribute-value">{creds?.['City']?.cred}</div>
                <div className="private-info-attribute-date-issued">{creds?.['City']?.completedAt}</div>
                <div className="private-info-attribute-issuer">{issuerAddrToName[creds?.['City']?.issuer]}</div>

                <div className="private-info-attribute-name">State</div>
                <div className="private-info-attribute-value">{creds?.['Subdivision']?.cred}</div>
                <div className="private-info-attribute-date-issued">{creds?.['Subdivision']?.completedAt}</div>
                <div className="private-info-attribute-issuer">{issuerAddrToName[creds?.['Subdivision']?.issuer]}</div>

                <div className="private-info-attribute-name">Zip Code</div>
                <div className="private-info-attribute-value">{creds?.['Zip Code']?.cred}</div>
                <div className="private-info-attribute-date-issued">{creds?.['Zip Code']?.completedAt}</div>
                <div className="private-info-attribute-issuer">{issuerAddrToName[creds?.['Zip Code']?.issuer]}</div>

                <div className="private-info-attribute-name">Country</div>
                <div className="private-info-attribute-value">{creds?.['Country']?.cred}</div>
                <div className="private-info-attribute-date-issued">{creds?.['Country']?.completedAt}</div>
                <div className="private-info-attribute-issuer">{issuerAddrToName[creds?.['Country']?.issuer]}</div>
              </>
            ) : (
              <>
                <div className="private-info-attribute-name">Government ID</div>
                <button onClick={() => navigate('/mint/idgov')} style={{ 
                  gridColumn: 'span 3',
                  textAlign: 'center',
                  padding: '5px',
                  backgroundColor: '#5e72eb',
                  border: '1px solid #5e72eb',
                  borderRadius: '10px'
                }}>
                  {/* TODO: Is there a better place for this button?  */}
                  Verify Government ID
                </button>
                {/* <div className="private-info-attribute-value">N/A</div>
                <div className="private-info-attribute-date-issued">N/A</div>
                <div className="private-info-attribute-issuer">N/A</div> */}
              </>
            )}
            {creds?.['Phone Number'] ? (
              <>
                <div className="private-info-attribute-name">Phone Number</div>
                <div className="private-info-attribute-value">{creds['Phone Number']?.cred}</div>
                <div className="private-info-attribute-date-issued">{creds?.['Phone Number']?.completedAt}</div>
                <div className="private-info-attribute-issuer">{issuerAddrToName[creds?.['Phone Number']?.issuer]}</div>
              </>
            ) : (
              <>
                <div className="private-info-attribute-name">Phone Number</div>
                <button onClick={() => navigate('/mint/phone')} style={{ 
                  gridColumn: 'span 3',
                  textAlign: 'center',
                  padding: '5px',
                  backgroundColor: '#5e72eb',
                  border: '1px solid #5e72eb',
                  borderRadius: '10px'
                }}>
                  {/* TODO: Is there a better place for this button?  */}
                  Verify Phone Number
                </button>
                {/* <div className="private-info-attribute-value">N/A</div>
                <div className="private-info-attribute-date-issued">N/A</div>
                <div className="private-info-attribute-issuer">N/A</div> */}
              </>
            )}
          </div>
        </div>
      </div>
  </>
  );
}
