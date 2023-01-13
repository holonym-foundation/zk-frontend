import { WithCheckMark } from "../atoms/checkmark";

const StepSuccess = () => {
  const toTweet = `Just tried out the Holonym beta version and minted my Holo: https://app.holonym.id/mint Each mint makes on-chain privacy stronger ⛓🎭`;
  return (
    <>
      <WithCheckMark size={3}>
        <h2>Success</h2>
      </WithCheckMark>
      <h5>
        By minting a Holo, you not only created an identity but also made the
        Privacy Pool (anonymity set) larger
      </h5>
      <br />
      <p>
        <a
          href="https://docs.holonym.id"
          target="_blank"
          style={{ color: "#2fd87a", textDecoration: "underline #2fd87a" }}
        >
          Learn about the privacy tech
        </a>
      </p>
      <p>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            toTweet
          )}`}
          target="_blank"
          style={{ color: "#2fd87a", textDecoration: "underline #2fd87a" }}
        >
          Bring more privacy to the web: Share your privacy pool contribution
        </a>
      </p>
      {/* <button className="x-button outline">Learn More</button> */}
      {/* <p>Or <a href="https://holonym.id/whitepaper.pdf" target="_blank" style={{color: "#2fd87a", textDecoration: "underline #2fd87a"}}>learn more</a></p> */}
    </>
  );
};

export default StepSuccess;
