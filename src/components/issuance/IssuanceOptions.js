import { useNavigate } from "react-router-dom";
// import { InfoButton } from "./info-button";
import RoundedWindow from "../RoundedWindow";
import phoneImg from "../../img/phone.png";
import idImg from "../../img/id.png";
import stethoscopeImg from "../../img/stethoscope-emoji.png";
import moneyImg from "../../img/money.png";
import questionImg from "../../img/question.png";

const opts = [
    { 
        name: "Phone Number", 
        url: "/issuance/phone", 
        image: phoneImg, 
        description: "This adds a phone number to your Holo if it's a real number / not a burner. It lets you to prove you're not a bot, for Sybil resistance.", 
        disabled: false 
    },
    { 
        name: "ID + Phone Number", 
        url: "/issuance/idgov", 
        image: idImg, 
        description: "This verifies your government ID (driver's license or ID card). You can prove you're not a bot for Sybil resistance. You can prove facts about your age, jurisdiction, and KYC/AML checks.", 
        disabled: false 
    },
    {
        name: "Medical Credentials", 
        url: "/issuance/med", 
        image: stethoscopeImg, 
        description: "This adds medical credentials to your Holo. It lets you prove that you are a doctor and what specialty you are in.", 
        disabled: false 
    },
    { 
        name: "Accredited Investor Status", 
        url: "/", image: moneyImg, 
        description: "This allows you to prove you are an accredited investor. It currently is not implemented.", 
        disabled: true 
    },
    { 
        name: "Custom", 
        url: "mailto:hello@holonym.id", image: questionImg, 
        description: "Contact us if there is any type of credential you'd like to see supported that aren't yet listed.", 
        disabled: true 
    }
];

const IssuanceOption = (props) => {
    const navigate = useNavigate();

    return <button onClick={() => {
                if (props.url.startsWith("mailto")) {
                    window.location.href = props.url;
                } else {
                    navigate(props.url)
                }
            }} className={`x-card blue${(props.disabled ? " disable" : "")}`} style={{width:"100%", /*marginTop: "16px", marginLeft : "100px", marginRight : "100px", */fontSize: "x-large"}}>
                <div style={{display:"flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "flex-start", flexDirection: "row"}}>
                    <img src={props.image} style={{height:"50px", marginRight: "20px"}} />
                    <h5>{props.name}</h5>
                </div>

                <div style={{display:"flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "flex-start", flexDirection: "row", textAlign: "left"}}>
                    <p>{props.description}</p>
                </div>
            </button>
}

const IssuanceOptions = () => {
    return <RoundedWindow>
                <div className="x-wrapper small-center" style={{height: "95%", width:"80%"}}>
                <h1>Choose your private credentials</h1>
                <h5 className="h5">to add to your Holo.</h5> 
                    {/* <h4>Warning: these become more private as time passes. For extra privacy, feel free to wait a bit</h4>
                    <InfoButton
                        type="proofMenu"
                        text={`Anonymity is provided by the anonymity set, a.k.a. Privacy Pool. If we wanted to spy and you only waited a minute, we could see you verified at a certain time and that some wallet submitted a proof a minute later. We could then guess you were that wallet. But if you waited a whole week, a lot of people have also will have registered, so we can't tell it's you. Everyone's verification would be pooled together, so we would only know the prover was one person in the whole pool. Whether you wait a second, a day, or year depends on how much you want to stay anonymous to Holonym Foundation. If you trust us not to track you, you can prove now...`}
                    /> */}
                <div className="verification-options" style={{
                    // display:"flex", flexWrap: "wrap", alignItems: "stretch", justifyContent: "space-around", flexDirection: "column"
                    }}>
                        {opts.map(opt=><IssuanceOption {...opt} />)}
                </div>
                {/* TODO: add buttons for future credential types such as accredited investor status */}
                {/* <button disabled onClick={()=>navigate("/")} className="x-button secondary">More proofs coming soon</button> */}
            </div>
    </RoundedWindow>
}
export default IssuanceOptions;
