import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAccount, useNetwork } from 'wagmi'
// import { InfoButton } from "./info-button";
import RoundedWindow from "./RoundedWindow";
import { chainIdUsedForLit } from "../constants/misc";
import phoneImg from "../img/phone.png";
import idImg from "../img/id.png";
import moneyImg from "../img/money.png";
import questionImg from "../img/question.png";

const opts = [
    { 
        name: "Phone Number", 
        url: "/mint/phone", 
        image: phoneImg, 
        description: "This adds a phone number to your Holo if it's a real number / not a burner. It lets you to prove you're not a bot, for Sybil resistance.", 
        disabled: false 
    },
    { name: 
        "ID + Phone Number", 
        url: "/mint/idgov", 
        image: idImg, 
        description: "This verifies your government ID. You can prove you're not a bot for Sybil resistance. You can prove facts about your age, jurisdiction, and KYC/AML checks", 
        disabled: false },
    { 
        name: "Accredited Investor Status", 
        url: "/", image: moneyImg, 
        description: "This allows you to prove you are an accredited investor. It currently is not implemented", 
        disabled: true 
    },
    { 
        name: "Custom", 
        url: "mailto:hello@holonym.id", image: questionImg, 
        description: "Contact us if there is any type of credential you'd like to see supported that aren't yet listed.", 
        disabled: true 
    }
];

const MintOption = (props) => {
    const navigate = useNavigate();

    return <button onClick={() => {
                if (props.url.startsWith("mailto")) {
                    window.location.href = props.url;
                } else {
                    navigate(props.url)
                }
            }} className={"x-card blue" + (props.disabled ? " disable" : "")} style={{width:"100%", /*marginTop: "16px", marginLeft : "100px", marginRight : "100px", */fontSize: "x-large"}}>
                <div style={{display:"flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "flex-start", flexDirection: "row"}}>
                    <img src={props.image} style={{height:"50px", marginRight: "20px"}}></img>
                    <h5>{props.name}</h5>
                </div>

                <div style={{display:"flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "flex-start", flexDirection: "row", textAlign: "left"}}>
                    <p>{props.description}</p>
                </div>
            </button>
}

const MintOptions = () => {
    const { data: account } = useAccount();
    const { switchNetwork } = useNetwork();

    useEffect(() => {
        if (!account) return;
        if (typeof switchNetwork != 'function') return; // this seems to address the unexpected "switchNetwork isn't a function" error
        switchNetwork(chainIdUsedForLit)
    }, [account, switchNetwork])

    return <RoundedWindow>
                <div className="x-wrapper small-center" style={{height: "95%", width:"80%"}}>
                <h1>Choose your private credentials</h1>
                <h5 className="h5">to add to your Holo. If you don't have a Holo, this will mint it for you.</h5> 
                    {/* <h4>Warning: these become more private as time passes. For extra privacy, feel free to wait a bit</h4>
                    <InfoButton
                        type="proofMenu"
                        text={`Anonymity is provided by the anonymity set, a.k.a. Privacy Pool. If we wanted to spy and you only waited a minute, we could see you verified at a certain time and that some wallet submitted a proof a minute later. We could then guess you were that wallet. But if you waited a whole week, a lot of people have also will have registered, so we can't tell it's you. Everyone's verification would be pooled together, so we would only know the prover was one person in the whole pool. Whether you wait a second, a day, or year depends on how much you want to stay anonymous to Holonym Foundation. If you trust us not to track you, you can prove now...`}
                    /> */}
                <div className="mint-options" style={{
                    // display:"flex", flexWrap: "wrap", alignItems: "stretch", justifyContent: "space-around", flexDirection: "column"
                    }}>
                        {opts.map(opt=><MintOption {...opt} />)}
                </div>
                {/* TODO: add buttons for future credential types such as accredited investor status */}
                {/* <button disabled onClick={()=>navigate("/")} className="x-button secondary">More proofs coming soon</button> */}
            </div>
    </RoundedWindow>
}
export default MintOptions;
