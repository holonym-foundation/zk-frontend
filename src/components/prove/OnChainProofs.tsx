import { useNavigate } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import { TransactionReceipt } from "viem";
import { useMutation } from "@tanstack/react-query";
import { Success } from "../success";
import { truncateAddress } from "../../utils/ui-helpers";
import RoundedWindow from "../RoundedWindow";
import { useProofMetadata } from "../../context/ProofMetadata";
import { defaultChainToProveOn } from "../../constants";
import Relayer from "../../utils/relayer";
import useGenericProofsState from "./useGenericProofsState";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";

const SUBMIT_PROOF = "submitProof";

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
  const navigate = useNavigate();
  const {
    params,
    proofs,
    // alreadyHasSBT,
    accountReadyAddress,
    hasNecessaryCreds,
    nonUSResidentTryingToProveUSResidency,
    proof,
    submissionConsent,
    setSubmissionConsent,
    proofSubmissionSuccess,
    setProofSubmissionSuccess,
    error,
    setError,
  } = useGenericProofsState();
  const { addProofMetadataItem } = useProofMetadata();

  const { 
    data: txReceipt,
    isLoading: submittingProof,
    isError: submitProofError,
    mutate: submitProof,
  } = useMutation(
    () => {
      return Relayer.prove(
        proof,
        proofs[params.proofType! as keyof typeof proofs].contractName,
        defaultChainToProveOn,
      )
    },
    {
      onSuccess: async (txReceipt: TransactionReceipt) => {
        console.log("txReceipt from proof submission:", txReceipt);
        addProofMetadataItem(
          {
            ...txReceipt, 
            chainId: process.env.NODE_ENV === "development" ? 420 : 10,
          },
          proof!.inputs[1],
          params.proofType!,
          params.actionId
        );
        setProofSubmissionSuccess(true);
      },
      onError: (error: any) => {
        console.error("proofSubmissionError", error);
        datadogLogs.logger.error("proofSubmissionError", undefined, error);
        datadogRum.addError(error);

        setError({
          type: SUBMIT_PROOF,
          message: "An error occurred when submitting proof.",
        });
      }
    }
  )

  if (proofSubmissionSuccess) {
    if (params.callback) window.location.href = `https://${params.callback}`;
    if (window.localStorage.getItem("register-proofType")) {
      navigate(
        `/register?credentialType=${window.localStorage.getItem(
          "register-credentialType"
        )}&proofType=${window.localStorage.getItem(
          "register-proofType"
        )}&callback=${window.localStorage.getItem("register-callback")}`
      );
    }
    try {
      datadogLogs.logger.info("SuccessfulProofSubmission");
      // @ts-ignore
      window.fathom.trackGoal("E96HHORL", 10);
    } catch (err) {
      console.log(err);
    }

    return <Success title="Success" />;
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
        <h2>Prove {proofs[params!.proofType as keyof typeof proofs].name}</h2>
        <div className="spacer-med" />
        <br />
        {error?.message ? (
          <p>Error: {error.message}</p>
        // ) : alreadyHasSBT ? (
        //   <p>You already have a soul-bound token (SBT) for this attribute.</p>
        ) : hasNecessaryCreds ? (
          <p>
            Get a ZKSNARK NFT, which proves a fact about your identity while
            keeping your identity private.
            <code> {truncateAddress(accountReadyAddress)} </code> will mint a{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://cointelegraph.com/news/what-are-soulbound-tokens-sbts-and-how-do-they-work"
              style={{ color: "#fdc094" }}
            >
              soul-bound NFT
            </a>{" "}
            (SBT) showing only this one attribute of you:{" "}
            <code>{proofs[params!.proofType as keyof typeof proofs].name}</code>
          </p>
        ) : nonUSResidentTryingToProveUSResidency ? (
          <p>&nbsp;Only US residents can generate proofs of US residency.</p>
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
        {/* {!alreadyHasSBT && hasNecessaryCreds ? ( */}
        {hasNecessaryCreds ? (
          proof ? (
            <button
              className="x-button"
              onClick={() => {
                submitProof()
                // @ts-ignore
                window.fathom.trackGoal("OLGDI8EP", 0);
              }}
            >
              {submittingProof ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  Submitting
                  <CustomOval />
                </div>
              ) : (
                "Submit proof"
              )}
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
