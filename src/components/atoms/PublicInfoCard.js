import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { InfoButton } from "../info-button";

export default function PublicInfoCard({ proofMetadata }) {
  const navigate = useNavigate();

  return (
    <>
      {/* TODO: On small screens, just display attribute value (and have an accordian-style dropdown that displays the other columns) */}
      <div className="profile-info-card public-info">
        <div className="card-header">
          <h2 className="card-header-title">Soulbound Tokens</h2>
          <p>When you generate a proof, you can mint a soulbound token that records the proven fact.</p>
        </div>
        <div style={{ 
          margin: '10px', 
          padding: '0px', 
          border: 0, 
          height: "2px", 
          backgroundImage: "linear-gradient(to right, #5e72eb, transparent)" 
        }}></div>
        <div className="card-content">
          <div className="public-info-grid">
            <div style={{ fontWeight: 'bold' }}className="public-info-proof-name">Proof Type</div>
            <div style={{ fontWeight: 'bold' }}className="public-info-sbt-owner">SBT belongs to</div>

            <div className="public-info-proof-name">
              Unique Person
              <div style={{ position: "relative", left: "100px", bottom: "23px" }}>
                <InfoButton
                  type="inPlace"
                  text={`This shows whether you have publicly claimed a "Unique person" SBT at a certain address. You can only prove this at one address from one government ID, allowing for robust Sybil resistance`}
                />
              </div>
            </div>
            {proofMetadata?.['uniqueness']?.address ? (
              <div className="public-info-sbt-owner">{proofMetadata?.['uniqueness']?.address}</div>
            ) : (
              <button onClick={() => navigate('/prove/uniqueness')} style={{ 
                textAlign: 'center',
                padding: '5px',
                backgroundColor: '#5e72eb',
                border: '1px solid #5e72eb',
                borderRadius: '10px'
              }}>
                Prove uniqueness
              </button>
            )}

            <div className="public-info-proof-name">
              US Resident
              <div style={{ position: "relative", left: "85px", bottom: "23px" }}>
                <InfoButton
                  type="inPlace"
                  text="This shows whether you've publicly claimed a US residency SBT at a certain address"
                />
              </div>
            </div>
            {proofMetadata?.['us-residency']?.address ? (
              <div className="public-info-sbt-owner">{proofMetadata?.['us-residency']?.address}</div>              
            ) : (
              <button onClick={() => navigate('/prove/us-residency')} style={{ 
                textAlign: 'center',
                padding: '5px',
                backgroundColor: '#5e72eb',
                border: '1px solid #5e72eb', //fdc094
                borderRadius: '10px'
              }}>
                Prove US residency
              </button>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
