import { useNavigate } from "react-router-dom";
// import RoundedWindow from './RoundedWindow';
import ChooseCredentialStep from "../img/choose-credential-type-step.png";
import VerifyStep from "../img/verify-yourself-step.png";
import GenerateProofStep from "../img/generate-proof-step.png";

const Landing = () => {
  const navigate = useNavigate();

  const cardStyle = {
    color: "#fff",
    display: "flex",
    // alignItems: 'center',
    justifyContent: "center",
    flexDirection: "row" as const,
    padding: "50px",
  };

  const imageStyle = {
    width: "100%",
    padding: "20px",
    marginBottom: "20px",
    maxWidth: "600px",
    filter: "drop-shadow(0px 0px 15px #9f5af0)",
    borderRadius: "80px",
  };

  const textDivStyle = {
    padding: "20px",
    margin: "auto auto",
  };

  const headingStyle = {
    fontSize: "24px",
  };

  const paragraphStyle = {
    fontSize: "18px",
  };

  // outerContainer and innerContainer are similar to the styles of RoundedWindow
  const outerContainer = {
    marginTop: "50px",
    marginBottom: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column" as const,
  };
  const innerContainer = {
    backgroundColor: "var(--dark-card-background)",
    // position: "absolute",
    // paddingLeft: "5vw",
    // paddingRight: "5vw",
    // width:"80%",
    // minHeight:"80%",
    borderRadius: "100px",
    border: "1px solid white",
    display: "flex",
    justifyContent: "flex-start",
    flexDirection: "column" as const,
    overflow: "auto",

    // margin: '0 auto',
    maxWidth: "1200px",
    textAlign: "center" as const,
  };

  return (
    <>
      <div style={outerContainer}>
        <div style={innerContainer}>
          <h3
            style={{
              marginTop: "30px",
              textAlign: "center",
            }}
          >
            Build Your Holo
          </h3>
          <div style={{ marginBottom: "50px" }}>
            <div style={cardStyle}>
              <div style={textDivStyle}>
                <h2 style={headingStyle}>1. Choose a Credential Type</h2>
                <p style={paragraphStyle}>
                  You can come back later and verify other credentials too.
                </p>
              </div>
              <img
                src={ChooseCredentialStep}
                alt="Choose a credential type"
                style={imageStyle}
              />
            </div>
            <div style={cardStyle}>
              <img src={VerifyStep} alt="Verify Yourself" style={imageStyle} />
              <div style={textDivStyle}>
                <h2 style={headingStyle}>2. Verify Yourself</h2>
                <p style={paragraphStyle}>
                  Verify yourself using the chosen credential type.
                </p>
              </div>
            </div>
            <div style={cardStyle}>
              <div style={textDivStyle}>
                <h2 style={headingStyle}>3. Generate a Proof</h2>
                <p style={paragraphStyle}>
                  Generate a zero knowledge proof about some aspect of your
                  identity, and receive a soulbound token.
                </p>
              </div>
              <img
                src={GenerateProofStep}
                alt="Generate a Proof"
                style={imageStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: "75px" }}>
            {/* rome-ignore lint/a11y/useValidAnchor: <explanation> */}
            <a
              href="/issuance"
              className="glowy-green-button"
              style={{ lineHeight: "1", fontSize: "18px" }}
              rel="noreferrer"
              onClick={(event) => {
                event.preventDefault();
                navigate("/issuance");
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </>

    // TODO: Add a "What Can You Do With Your Holo?" section. Include links to Lobby3, etc.
  );
};

export default Landing;
