import RoundedWindow from "./RoundedWindow"

export const PaymentScreen = () => { 
    return <RoundedWindow>
       <div
          className="x-wrapper small-center"
          style={{ display: "flex", height: "95%", width: "80%", alignItems: "stretch", justifyContent: "stretch", flexDirection: "column", gap: "50px" }}
        >
            <h1>Bond & Fee</h1>

        <a className="glowy-green-button" style={{ width: "100%", fontSize: "20px" }}>Pay In FTM</a>
        <a className="glowy-red-button" style={{ width: "100%", fontSize: "20px" }}>Pay In OP ETH</a>
        <a className="x-button-blue greyed-out-button" style={{ width: "100%", fontSize: "20px" }}>Pay In Fiat (coming soon)</a>

    </div> 
    </RoundedWindow>
}

export const PaymentPrereqs = () => { 
    return <RoundedWindow>
       <div
          className="x-wrapper small-center"
          style={{ display: "flex", height: "95%", width: "80%", alignItems: "stretch", justifyContent: "stretch", flexDirection: "column", gap: "50px" }}
        >
  
          <h1>Before we proceed, make sure you have:</h1>
         
          <div
            className="checklist"
          >
            <ol>
              <li>Protocol bond <code style={{color: "var(--holo-light-blue)"}}>($2.47)</code> and zkNFT minting fee <code style={{color: "var(--holo-light-blue)"}}>($10)</code>. Crypto or Fiat accepted.</li>
              <li>Government ID on-hand</li>
            </ol>
          </div>
          <p>The zkSBT minting fee will be refunded if ID verification is unsuccessful</p>
          {/* <p>This is a privacy-preserving KYC service. We do not store your data beyond the most minimal necessary. We do not sell your data. All sensitive data is protected by zero-knowledge proofs. For more information on how we protect your privacy, see our <a href="/privacy" target="_blank">privacy page</a> or <a href="https://docs.holonym.id/" target="_blank">docs</a>.</p> */}
          <a href="/issuance/idgov" className="glowy-green-button" style={{ width: "100%", fontSize: "20px" }}>Continue</a>
          <p>This is a privacy-centric service. For more info, see <a href="/privacy" target="_blank">privacy</a></p>
  
    </div> 
    </RoundedWindow>
}