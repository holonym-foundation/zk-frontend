import fwBlue from "../img/Holo-Fireworks-Blue.png";
import fwBlue500 from "../img/Holo-Fireworks-Blue-p-500.png";
import fwRed from "../img/Holo-Fireworks-Red.png";
import fwRed500 from "../img/Holo-Fireworks-Red-p-500.png";
import fwRed800 from "../img/Holo-Fireworks-Red-p-800.png";
import { useNavigate } from "react-router-dom";

export const Success = (props: { title?: string }) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="fireworks-div">
        <img
          src={fwBlue}
          loading="lazy"
          sizes="100vw"
          srcSet={`${fwBlue500} 500w, ${fwBlue} 658w`}
          alt=""
          className="fireworks-1"
        />
        <img
          src={fwRed}
          loading="lazy"
          sizes="100vw"
          srcSet={`${fwRed500} 500w, ${fwRed800} 800w, ${fwRed} 904w`}
          alt=""
          className="fireworks-2"
        />
      </div>
      <div className="x-section product wf-section">
        <div className="x-container product w-container">
          <div className="x-pre-wrapper">
            <h1 className="h1">{props.title || "Verification Success"}</h1>
            {/* <div className="card-heading"> */}

            {/* <h3 className="h3 no-margin">You are free to submit some proofs or return home</h3> */}
            {/* <img src={CircleWavyCheck} loading="lazy" alt="" className="verify-icon" />
                    </div>
                    <div className="spacer-xx-small"></div>
                    <p className="identity-text">Johnald Trump</p>
                    <div className="spacer-small"></div> */}
            <div className="identity-verified-btn-div">
              {/* <a href="#" className="x-button secondary outline w-button">view tranaction</a> */}
              {/* <div className="spacer-x-small"></div> */}

              <div className="spacer-large" />

              <a
                // @ts-ignore
                href={() => false}
                onClick={() => navigate("/")}
                className="x-button secondary"
              >
                Go home
              </a>

              <div className="spacer-x-small" />
              <div className="spacer-x-small" />
              <h4>Or</h4>
              <div className="spacer-x-small" />
              <div className="spacer-x-small" />

              <a
                // @ts-ignore
                href={() => false}
                onClick={() => navigate("/prove")}
                className="x-button secondary"
              >
                Prove stuff about yourself
              </a>

              <div className="spacer-x-small" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
