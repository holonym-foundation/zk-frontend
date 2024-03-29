import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useIdvSessionStatus from "../../../../hooks/useIdvSessionStatus";
import useVeriffIDV from "../../../../hooks/useVeriffIDV";
import { idServerUrl } from "../../../../constants";
import { datadogLogs } from "@datadog/browser-logs";
import { SessionStatusResponse } from "../../../../types";

const StepIDVVeriff = ({ url, sessionId }: { url?: string, sessionId: string }) => {
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
  const { encodedRetrievalEndpoint: veriffRetrievalEndpoint } = useVeriffIDV({
    url,
    sessionId
  });

  const [verificationError, setVerificationError] = useState("");

  const idvSessionStatusQuery = useIdvSessionStatus(sid ?? undefined, {
    onSuccess: (data: Omit<SessionStatusResponse, "idenfy" | "onfido">) => {
      if (!data) return;

      // See: https://developers.veriff.com/#verification-session-status-and-decision-codes
      const unsuccessfulVeriffStatuses = [
        "declined",
        "resubmission_requested",
        "abandoned",
        "expired",
      ];

      let hasSuccessfulSession = false;
      if (data?.veriff?.status) {
        if (veriffRetrievalEndpoint) {
          if (data?.veriff?.status === "approved" || data?.veriff?.status === "declined") {
            navigate(
              `/issuance/idgov-veriff/store?sid=${sid}&retrievalEndpoint=${veriffRetrievalEndpoint}`
            );
          } else if (
            unsuccessfulVeriffStatuses.includes(data?.veriff?.status)
          ) {
            setVerificationError(
              `Status of Veriff session ${data?.veriff?.sessionId} is '${data?.veriff?.status}'. Expected 'approved' or 'declined'.`
            );
          } else {
            console.log(
              `Veriff status is '${data?.veriff?.status}'. Expected 'approved' or 'declined'.`
            );
          }
        } else {
          // If the user has a successful session but the retrieval endpoint isn't populated, then
          // they are a returning user who didn't complete the "finalize" step of issuance.
          if (data?.veriff?.status === "approved") {
            hasSuccessfulSession = true;
            const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${data?.veriff?.sessionId}`;
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
                    `/issuance/idgov-veriff/store?sid=${sid}&retrievalEndpoint=${retrievalEndpointForReturningUser}`
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
          {idvSessionStatusQuery?.data?.["veriff"]?.status && (
            <div style={{ textAlign: "center" }}>
              <p>
                Verification status:{" "}
                {idvSessionStatusQuery?.data?.["veriff"]?.status}
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

export default StepIDVVeriff;
