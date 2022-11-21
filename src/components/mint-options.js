import { useNavigate } from "react-router-dom";
// import { InfoButton } from "./info-button";
import RoundedWindow from "./RoundedWindow";

const MintOptions = ()=>{
    const navigate = useNavigate();
    return <RoundedWindow>
            <div className="x-wrapper small-center" style={{width:"100%"}}>
                <h1>Verify yourself, with privacy</h1>
                <h5>If you don't have a Holo, you can mint one with the following credentials. If you already have one, you can add one of the following credentials to it</h5> 
                    {/* <h4>Warning: these become more private as time passes. For extra privacy, feel free to wait a bit</h4>
                    <InfoButton
                        type="proofMenu"
                        text={`Anonymity is provided by the anonymity set, a.k.a. Privacy Pool. If we wanted to spy and you only waited a minute, we could see you verified at a certain time and that some wallet submitted a proof a minute later. We could then guess you were that wallet. But if you waited a whole week, a lot of people have also will have registered, so we can't tell it's you. Everyone's verification would be pooled together, so we would only know the prover was one person in the whole pool. Whether you wait a second, a day, or year depends on how much you want to stay anonymous to Holonym Foundation. If you trust us not to track you, you can prove now...`}
                    /> */}
                <div className="spacer-large"></div>
                <button onClick={()=>navigate("/mint/phone")} className="x-card blue">
                    Phone Number
                    {/* <p>Surprisingly rigorous</p> */}
                </button>
                <div className="spacer-large"></div>
                <button onClick={()=>navigate("/mint/idgov")} className="x-card blue">
                    ID + Phone Number
                    {/* <p>Most informative and rigorous; hard to fake identity and extremely hard to create sybil attacks</p> */}
                </button>
                <div className="spacer-large"></div>
                {/* TODO: add buttons for future credential types such as accredited investor status */}
                {/* <button disabled onClick={()=>navigate("/")} className="x-button secondary">More proofs coming soon</button> */}

            </div>
    </RoundedWindow>  
}
export default MintOptions;
