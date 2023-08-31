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
    description:
      "Verifies a real phone number, blocking burners. Helps show you're not a bot.",
    price: ".005",
    disabled: false,
  },
  {
    name: "Government ID",
    url: "/issuance/idgov",
    image: idImg,
    description: (
      <>
        <b>
          🤖 Get the <span style={{ color: "greenyellow" }}>NFT </span> for a
          higher Gitcoin sybil-resistance score 🤖
        </b>
        <br />
        Verifies your government ID in a ZK-compatible way. It does not store
        your data or doxx you
      </>
    ),
    price: ".005",
    disabled: false,
  },
  // {
  //     name: "Medical Credentials",
  //     // url: "/issuance/med",
  //     url: "/issuance",
  //     image: stethoscopeImg,
  //     description: "This adds medical credentials to your Holo. It lets you prove that you are a doctor and what specialty you are in.",
  //     disabled: true // TODO: Re-enable once it is working
  // },
  {
    name: "Accredited Investor Status",
    url: "/",
    image: moneyImg,
    description:
      "This allows you to prove you are an accredited investor. It currently is not implemented.",
    disabled: true,
  },
  {
    name: "Custom",
    url: "mailto:hello@holonym.id",
    image: questionImg,
    description:
      "Contact us if there is any type of credential you'd like to see supported that aren't yet listed.",
    disabled: true,
  },
];

const IssuanceOption = (props: {
  name: string;
  url: string;
  image: string;
  description: string | JSX.Element;
  price?: string;
  disabled: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        if (props.url.startsWith("mailto")) {
          window.location.href = props.url;
        } else {
          navigate(props.url);
        }
      }}
      className={`x-card blue${props.disabled ? " disable" : ""}`}
      style={{
        width: "100%",
        /*marginTop: "16px", marginLeft : "100px", marginRight : "100px", */ fontSize:
          "x-large",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          flexDirection: "row",
        }}
      >
        <img
          alt=""
          src={props.image}
          style={{ height: "50px", marginRight: "20px" }}
        />
        <h5>{props.name}</h5>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          flexDirection: "row",
          textAlign: "left",
        }}
      >
        <p>{props.description}</p>
        {props.price ? (
          <p style={{ color: "greenyellow" }}>
            <b>NFT:</b> {props.price} ETH
          </p>
        ) : null}
      </div>
    </button>
  );
};

const IssuanceOptions = () => {
  return (
    <RoundedWindow>
      <div
        className="x-wrapper small-center"
        style={{ height: "95%", width: "80%" }}
      >
        <h1>Choose your private credentials</h1>
        <h5 className="h5">to add to your Holo.</h5>
        {/* <h4>Warning: these become more private as time passes. For extra privacy, feel free to wait a bit</h4>
                    <InfoButton
                        type="proofMenu"
                        text={`Anonymity is provided by the anonymity set, a.k.a. Privacy Pool. If we wanted to spy and you only waited a minute, we could see you verified at a certain time and that some wallet submitted a proof a minute later. We could then guess you were that wallet. But if you waited a whole week, a lot of people have also will have registered, so we can't tell it's you. Everyone's verification would be pooled together, so we would only know the prover was one person in the whole pool. Whether you wait a second, a day, or year depends on how much you want to stay anonymous to Holonym Foundation. If you trust us not to track you, you can prove now...`}
                    /> */}
        <div
          className="verification-options"
          style={
            {
              // display:"flex", flexWrap: "wrap", alignItems: "stretch", justifyContent: "space-around", flexDirection: "column"
            }
          }
        >
          {opts.map((opt) => (
            <IssuanceOption {...opt} />
          ))}
        </div>
        {/* TODO: add buttons for future credential types such as accredited investor status */}
        {/* <button disabled onClick={()=>navigate("/")} className="x-button secondary">More proofs coming soon</button> */}
      </div>
      <div 
        className="x-wrapper small-center"
        style={{ marginTop: "30px", width: "80%" }}
      >
        <p>Holonym is a privacy tool to verify your identity with minimal leakage of information. Your phone number and government ID are never linked to your address. Data is deleted from third party servers after you complete verification. Your data is encrypted with your wallet key and can only be read by you.</p>
      </div>
    </RoundedWindow>
  );
};
export default IssuanceOptions;
