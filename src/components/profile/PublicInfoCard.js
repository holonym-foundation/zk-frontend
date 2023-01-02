import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { InfoButton } from "../info-button";
import ColoredHorizontalRule from "../atoms/ColoredHorizontalRule";

const ProveButton = ({ onClick, text}) => (
  <button onClick={onClick} className="profile-prove-button">
    {text}
  </button>
)

const ProofRow = ({ proofTitle, infoText, address, onClickProve, buttonText }) => (
  <>
    <div className="public-info-proof-name">
      {proofTitle}
      <div style={{ position: "relative", left: "100px", bottom: "23px" }}>
        <InfoButton
          type="inPlace"
          text={infoText}
        />
      </div>
    </div>
    {address ? (
      <div className="public-info-sbt-owner">{address}</div>
    ) : (
      <ProveButton onClick={onClickProve} text={buttonText}/>
    )}
  </>
)

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
        <ColoredHorizontalRule />
        <div className="card-content">
          <div className="public-info-grid">
            <div style={{ fontWeight: 'bold' }} className="public-info-proof-name">Proof Type</div>
            <div style={{ fontWeight: 'bold' }} className="public-info-sbt-owner">SBT belongs to</div>

            <ProofRow
              proofTitle="Unique Person"
              infoText={`This shows whether you have publicly claimed a "Unique person" SBT at a certain address. You can only prove this at one address from one government ID, allowing for robust Sybil resistance`}
              address={proofMetadata?.['uniqueness']?.address}
              onClickProve={() => navigate('/prove/uniqueness')}
              buttonText="Prove uniqueness"
            />

            <ProofRow
              proofTitle="US Resident"
              infoText={`This shows whether you've publicly claimed a US residency SBT at a certain address`}
              address={proofMetadata?.['us-residency']?.address}
              onClickProve={() => navigate('/prove/us-residency')}
              buttonText="Prove US residency"
            />

          </div>
        </div>
      </div>
    </>
  );
}
