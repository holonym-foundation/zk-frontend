import React, { useState } from 'react';

function Banner() {
  return (
    <div>
      <div style={{ marginTop: '0', backgroundColor: "#01010C", textAlign: 'center', boxShadow: "0 0px 3px #fdc094" }}>
        <p style={{ color: "#fff", fontSize: "1.5rem", fontFamily: "Clover Semibold", marginBottom: "0px" }}>
          Welcome to the Holonym Beta!
        </p>
        <p style={{ color: '#fff' }}>
          <span style={{ color:'#2fd87a', padding: '10px', fontSize: '1rem' }}>{'\u2713'}</span>
          Your privacy is gauranteed by strong cryptography.
          <br/>
          View{" "}
          <a className="in-text-link" href="https://docs.holonym.id/introduction/private-credentials" target="_blank" rel="noreferrer">
            our docs
          </a>{" "}
          to learn about how Holonym stores information.
        </p>
        <p>
        </p>
      </div>
    </div>
  );
}

export default Banner;
