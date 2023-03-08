import { useNavigate } from "react-router-dom";
import { WithCheckMark } from "../atoms/checkmark";

const StepSuccess = () => {
  const navigate = useNavigate();
  const toTweet = `Just tried out the Holonym beta version and verified myself: https://app.holonym.id/verify Each verification makes on-chain privacy stronger ⛓🎭`;
  return (
    <>
      <WithCheckMark size={3}>
        <h2>Success</h2>
      </WithCheckMark>
      {/* <h5>
        By verifying yourself, you not only created an identity but also made the
        Privacy Pool (anonymity set) larger
      </h5>
      <br /> */}
      <div style={{ display: "flex"}}>
        <a
          href="/prove"
          className="glowy-green-button"
          style={{ lineHeight: "1", fontSize: "16px" }}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            event.preventDefault();
            navigate("/prove");
          }}
        >
          Get Soulbound tokens
        </a>
        <div style={{ margin: "10px" }}></div>
        <a
          href="/profile"
          className="x-button secondary outline"
          style={{ lineHeight: "1", fontSize: "16px" }}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            event.preventDefault();
            navigate("/profile");
          }}
        >
          View my Holo
        </a>
      </div>
      {/* <p>
        <a
          href="https://docs.holonym.id"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#2fd87a", textDecoration: "underline #2fd87a" }}
        >
          Learn about the privacy tech
        </a>
      </p> */}
      {/* <p>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            toTweet
          )}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#2fd87a", textDecoration: "underline #2fd87a" }}
        >
          Bring more privacy to the web: Share your privacy pool contribution
        </a>
      </p> */}
      {/* <button className="x-button outline">Learn More</button> */}
      {/* <p>Or <a href="https://holonym.id/whitepaper.pdf" target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>learn more</a></p> */}
    </>
  );
};

export default StepSuccess;
