import React from 'react';


function Banner() {
  // const [showBanner, setShowBanner] = useSessionStorage('showBanner', true);

  return (
    <div
      style={{
        position: 'relative',
        display: 'block', // showBanner ? 'block' : 'none',
        backgroundColor: '#01010C',
        boxShadow: '0 0px 4px #fdc094',
        borderRadius: '20px',
        backgroundImage: `linear-gradient(
          135deg,
          #fdc094 0%,
          #01010c 20%,
          #01010c 80%,
          #fdc094 100%
        )`,
        textAlign: 'center',
        color: '#fff',
        fontSize: '1.5rem',
        fontFamily: 'Clover Semibold',
        marginTop: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '23px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: "1.5rem", fontFamily: "Clover Semibold" }}>
          Heads up! The Holonym Legacy App is now Deprecated
          </p>
          <p>
            {/* <span style={{ color:'#2fd87a', padding: '10px', fontSize: '1.3rem' }}>{'\u2713'}</span>
              Your privacy is preserved by zero knowledge proofs and threshold encryption.
            <span style={{ color:'#2fd87a', padding: '10px', fontSize: '1.3rem' }}>{'\u2713'}</span> */}
            Verification time may take 30minutes to days depending on user device capabilities. We strongly recommend using the new version of Holonym to verify quickly with a bug-free experience.
            <br/>
            <a 
              className="in-text-link" 
              href="https://docs.holonym.id/introduction/private-credentials" 
              target="_blank" 
              rel="noreferrer"
            >
              Verify now with the new Holonym
            </a>
            {/* View{" "}
            <a className="in-text-link" href="https://docs.holonym.id/introduction/private-credentials" target="_blank" rel="noreferrer">
              our docs
            </a>{" "} */}
          </p>
        </div>
      </div>
      {/* <button className="banner-button" onClick={() => setShowBanner(false)} >
        X
      </button> */}
    </div>
  );
}

export default Banner;
