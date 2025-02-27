import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useIdvSessionStatus from "../../../../hooks/useIdvSessionStatus";
import useOnfidoIDV from "../../../../hooks/useOnfidoIDV";
import { idServerUrl } from "../../../../constants";
import { datadogLogs } from "@datadog/browser-logs";
import { SessionStatusResponse } from "../../../../types";

const StepIDV = () => {
  useEffect(() => {
    try {
      datadogLogs.logger.info("StartGovID", {});
      // @ts-ignore
      window.fathom.trackGoal("DCTNZBL9", 0);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sid = searchParams.get("sid");
  const [
    returningUserHasSuccessfulSession,
    setReturningUserHasSuccessfulSession,
  ] = useState("loading"); // 'loading' | 'yes' | 'no'
  const [
    retrievalEndpointForReturningUser,
    setRetrievalEndpointForReturningUser,
  ] = useState("");
  const { encodedRetrievalEndpoint: onfidoRetrievalEndpoint } = useOnfidoIDV({
    enabled: returningUserHasSuccessfulSession === "no",
  });

  const [verificationError, setVerificationError] = useState("");

  const idvSessionStatusQuery = useIdvSessionStatus(sid ?? undefined, {
    onSuccess: (data: Omit<SessionStatusResponse, "veriff" | "idenfy">) => {
      if (!data) return;

      // See: https://documentation.onfido.com/#check-status
      const unsuccessfulOnfidoStatuses = ["withdrawn", "paused", "reopened"];

      let hasSuccessfulSession = false;
      if (data?.onfido?.status) {
        if (onfidoRetrievalEndpoint) {
          if (data?.onfido?.status === "complete") {
            navigate(
              `/issuance/idgov-onfido/store?sid=${sid}&retrievalEndpoint=${onfidoRetrievalEndpoint}`
            );
          }
          // if (
          //   data?.onfido?.status === "complete" &&
          //   data?.onfido?.result === "clear"
          // ) {
          //   navigate(
          //     `/issuance/idgov-onfido/store?sid=${sid}&retrievalEndpoint=${onfidoRetrievalEndpoint}`
          //   );
          // } else if (
          //   data?.onfido?.status === "complete" &&
          //   data?.onfido?.result === "consider"
          // ) {
          //   setVerificationError(
          //     `Result of Onfido check ${data?.onfido?.check_id} is '${data?.onfido?.result}'. Expected 'clear'.`
          //   );
          // } 
          else if (
            unsuccessfulOnfidoStatuses.includes(data?.onfido?.status)
          ) {
            setVerificationError(
              `Status of Onfido check ${data?.onfido?.check_id} is '${data?.onfido?.status}'. Expected 'complete'.`
            );
          } else {
            console.log(
              `Onfido status is '${data?.onfido?.status}'. Expected 'complete'.`
            );
          }
        } else {
          // If the user has a successful session but the retrieval endpoint isn't populated, then
          // they are a returning user who didn't complete the "finalize" step of issuance.
          if (
            data?.onfido?.status === "complete" &&
            data?.onfido?.result === "clear" &&
            data?.onfido?.check_id
          ) {
            hasSuccessfulSession = true;
            const retrievalEndpoint = `${idServerUrl}/onfido/credentials?check_id=${data?.onfido?.check_id}`;
            const encodedRetrievalEndpoint = encodeURIComponent(
              window.btoa(retrievalEndpoint)
            );
            setRetrievalEndpointForReturningUser(encodedRetrievalEndpoint);
          }
        }
      }

      setReturningUserHasSuccessfulSession(hasSuccessfulSession ? "yes" : "no");
    },
  });

  return (
    <>
      <h3 style={{ marginBottom: "25px", marginTop: "-25px" }}>
        Verify your ID
      </h3>

      {returningUserHasSuccessfulSession === "loading" && (
        <div style={{ textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      )}

      {returningUserHasSuccessfulSession === "yes" && (
        <>
          <div style={{ textAlign: "center" }}>
            <p>It looks like you already verified yourself.</p>
            <p>Click continue to finalize verification.</p>
            <div
              style={{
                marginTop: "20px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                className="export-private-info-button"
                style={{
                  lineHeight: "1",
                  fontSize: "16px",
                }}
                onClick={() => {
                  navigate(
                    `/issuance/idgov-onfido/store?sid=${sid}&retrievalEndpoint=${retrievalEndpointForReturningUser}`
                  );
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}

      {returningUserHasSuccessfulSession !== "yes" && (
        <>
          <div id="onfido-mount"></div>

          {idvSessionStatusQuery?.data?.onfido?.status && (
            <div style={{ textAlign: "center" }}>
              <p>
                Verification status:{" "}
                {idvSessionStatusQuery?.data?.onfido?.status}
              </p>
              <p>
                Once your verification is successful, you will be redirected to
                the next step.
              </p>
            </div>
          )}

          {verificationError && (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "red" }}>{verificationError}</p>
              <p>
                Please try again or contact support if the problem persists.
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default StepIDV;
