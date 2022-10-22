import CircleWavyCheck from "../img/CircleWavyCheck.svg";
import { truncateAddress } from "../utils/ui-helpers.js";
import fwBlue from "../img/Holo-Fireworks-Blue.png";
import fwBlue500 from "../img/Holo-Fireworks-Blue-p-500.png";
import fwRed from "../img/Holo-Fireworks-Red.png";
import fwRed500 from "../img/Holo-Fireworks-Red-p-500.png";
import fwRed800 from "../img/Holo-Fireworks-Red-p-800.png";
// React component to display (part of) a JWT in the form of a javscript Object to the user
const ignoredFields = ["azp", "kid", "alg", "at_hash", "aud", "auth_time", "iss", "exp", "iat", "jti", "nonce", "email_verified", "rand"]; //these fields should still be checked but just not presented to the users as they are unecessary for the user's data privacy and confusing for the user
const DisplayJWTSection = (props) => {
  return (
    <>
      {Object.keys(props.section).map((key) => {
        if (ignoredFields.includes(key)) {
          return null;
        } else {
          let field = key;
          let value = props.section[key];
          // give a human readable name to important field:
          if (field === "creds") {
            field = "Credentials";
          }
          if (field === "sub") {
            field = `${props.web2service} ID`;
          }
          if (field === "given_name") {
            field = "Given First Name";
          }
          if (field === "family_name") {
            field = "Given Last Name";
          }
          if (field === "picture") {
            value = <img style={{ borderRadius: "7px" }} src={value} alt="" />;
          }
          // capitalize first letter:
          field = field.replace("_", " ");
          field = field[0].toUpperCase() + field.substring(1);

          return (
            <div>
              <h3>{field}</h3>
              <p className="identity-text">{value}</p>
            </div>
          );
        }
      })}
    </>
  );
};

export const MessageScreen = (props) => 
(
  <div className="bg-img x-section wf-section" style={{ height: "100vh", width: "100vw" }}>
    <div className="x-container w-container" style={{ marginTop: "100px" }}>
      <h3>{props.msg}</h3>
    </div>
  </div>
);


export const FinalScreen = (props) => (
  <>
  <div className="fireworks-div">
    <img src={fwBlue} loading="lazy" sizes="100vw" srcSet={`${fwBlue500} 500w, ${fwBlue} 658w`} alt="" className="fireworks-1" />
    <img src={fwRed} loading="lazy" sizes="100vw" srcSet={`${fwRed500} 500w, ${fwRed800} 800w, ${fwRed} 904w`} alt="" className="fireworks-2" /></div>
    <div className="x-section product wf-section">
      <div className="x-container product w-container">
        <div className="x-pre-wrapper">
        <h1 className="h1">You're verified</h1>
                    <div className="card-heading">
                      
                      <h3 className="h3 no-margin">{props.web2service + " ID"}</h3>
                      <img src={CircleWavyCheck} loading="lazy" alt="" className="verify-icon" />
                    </div>
                    <div className="spacer-xx-small"></div>
                    <p className="identity-text">{props.creds}</p>
                    <div className="spacer-small"></div>
              <div className="identity-verified-btn-div">
                {/* <a href="#" className="x-button secondary outline w-button">view tranaction</a> */}
                {/* <div className="spacer-x-small"></div> */}
                
                <a href={`/myholo`} className="x-button secondary">
                  Go to my Holo
                </a>
                {/* <a href={`/myholo`} className="x-button secondary outline">
                  Go to my Holo
                </a> */}
                <div className="spacer-x-small"></div>
                </div>
        </div>
      </div>
  </div>
  </>
  
)

export const ApproveJWT = (props) => (
  <div className="bg-img x-section wf-section" style={{ width: "100vw" }}>
          <div className="x-container w-container">
            <div className="x-wrapper small-center">
              <div className="spacer-small"></div>
              <div className="x-wrapper no-flex">
                <div className="spacer-large larger"></div> 
                <h1 className="h1">Confirm Identity</h1>
                <h4 className="p-1 white">
                  Confirm you would like to publicly link your address <code>{props.account ? truncateAddress(props.account.address) : null}</code> and its
                  history with{" "}
                </h4>
                <DisplayJWTSection section={props.JWTObject.payload.parsed} web2service={props.web2service} />
              </div>
              <div className="spacer-medium"></div>
              <a
                className="x-button secondary"
                onClick={props.callback}
              >
                submit public holo
              </a>
              <div className="spacer-small"></div>
              <div className="identity-info-div"></div>
            </div>
          </div>
        </div>
)