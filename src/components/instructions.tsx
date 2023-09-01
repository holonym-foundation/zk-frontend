import RoundedWindow from "./RoundedWindow"

const PaymentScreen = () => { 
    return <RoundedWindow>
       <div
          className="x-wrapper small-center"
          style={{ display: "flex", height: "95%", width: "80%", alignItems: "stretch", justifyContent: "stretch", flexDirection: "column", gap: "50px" }}
        >
  
          <h1>Before we proceed, make sure you have:</h1>
          {/* <h5 className="h5">to add to your Holo.</h5> */}
          {/* <h4>Warning: these become more private as time passes. For extra privacy, feel free to wait a bit</h4>
                      <InfoButton
                          type="proofMenu"
                          text={`Anonymity is provided by the anonymity set, a.k.a. Privacy Pool. If we wanted to spy and you only waited a minute, we could see you verified at a certain time and that some wallet submitted a proof a minute later. We could then guess you were that wallet. But if you waited a whole week, a lot of people have also will have registered, so we can't tell it's you. Everyone's verification would be pooled together, so we would only know the prover was one person in the whole pool. Whether you wait a second, a day, or year depends on how much you want to stay anonymous to Holonym Foundation. If you trust us not to track you, you can prove now...`}
                      /> */}
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

export default PaymentScreen;