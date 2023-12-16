import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { clientPortalUrl } from "../../constants";
import { Oval } from "react-loader-spinner";
import RoundedWindow from "../RoundedWindow";
import useGenericProofsState from "./useGenericProofsState";

const CustomOval = () => (
  <Oval
    height={10}
    width={10}
    color="#464646"
    wrapperStyle={{ marginLeft: "5px" }}
    wrapperClass=""
    visible={true}
    ariaLabel="oval-loading"
    secondaryColor="#01010c"
    strokeWidth={2}
    strokeWidthSecondary={2}
  />
);

const LoadingProofsButton = (props: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => (
  <button className="x-button" onClick={props.onClick}>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      Proof Loading
      <CustomOval />
    </div>
  </button>
);

const Proofs = () => {
  const [searchParams] = useSearchParams();
  const { params, proofs, hasNecessaryCreds, proof, error, setError } =
    useGenericProofsState();

  // Steps:
  // 1. Ensure callback param is present
  // 2. Redirect user to callback URL & include proof in query params

  useEffect(() => {
    (async () => {
      // Get callback from URL
      const callbackUrl = searchParams.get("callback");
      if (!callbackUrl) setError({ message: "Missing callback" });
    })();
  }, [searchParams]);

  function handleSubmit() {
    if (error || !proof) return;
    // Redirect user to callback URL & include proof in query params
    const callback = searchParams.get("callback");
    const proofString = encodeURIComponent(JSON.stringify(proof));
    // TODO: Encrypt (at least part of) proof using client's public encryption key
    window.location.href = `${callback}?proof=${proofString}`;
  }

  return (
    <RoundedWindow>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2>Prove {proofs[params.proofType! as keyof typeof proofs].name}</h2>
        <div className="spacer-med" />
        <br />
        {error?.message ? (
          <p style={{ color: "red", fontSize: "1rem" }}>
            Error: {error.message}
          </p>
        ) : hasNecessaryCreds ? (
          <p>
            This will generate a proof showing only this one attribute of you:{" "}
            <code>{proofs[params.proofType! as keyof typeof proofs].name}</code>.
          </p>
        ) : (
          <p>
            &nbsp;Note: You cannot generate this proof without the necessary
            credentials. If you have not already, please{" "}
            {/* TODO: Get specific. Tell the user which credentials they need to get/verify. */}
            <a href="/issuance" style={{ color: "#fdc094" }}>
              verify yourself
            </a>
            .
          </p>
        )}
        <div className="spacer-med" />
        <br />
        {hasNecessaryCreds ? (
          proof ? (
            <button className="x-button" onClick={handleSubmit}>
              Submit proof
            </button>
          ) : (
            <LoadingProofsButton />
          )
        ) : (
          ""
        )}
      </div>
    </RoundedWindow>
  );
};

export default Proofs;
