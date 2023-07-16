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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '33px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: "1.5rem", fontFamily: "Clover Semibold" }}>
            Experiencing High Demand
          </p>
          <p>
            {/* <span style={{ color:'#2fd87a', padding: '10px', fontSize: '1.3rem' }}>{'\u2713'}</span>
              Your privacy is preserved by zero knowledge proofs and threshold encryption.
            <span style={{ color:'#2fd87a', padding: '10px', fontSize: '1.3rem' }}>{'\u2713'}</span> */}
            To cover skyrocketing identity verification costs of the infux of users, we have to start charging. If we were building in Web2, where users are the product, this would be difficult.
            But web3 gives the ability to tokenize. Now with every proof you also pay 5 OP to recieve a soulbound NFT of your zero-knowledge identity proof. 
            <br/>
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
