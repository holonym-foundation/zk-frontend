import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../atoms/Modal";
import { SessionStatusResponse } from "../../types";

type GovIdRetrievalEndpoints = {
  veriff?: {
    sid: string;
    retrievalEndpoint: string;
  };
  idenfy?: {
    sid: string;
    retrievalEndpoint: string;
  };
  onfido?: {
    sid: string;
    retrievalEndpoint: string;
  };
};

type StatusOverviewProps = {
  govIdRetrievalEndpoints: GovIdRetrievalEndpoints;
  consolidatedIdvSessionStatus?: Partial<SessionStatusResponse>;
  onfidoStatus?: string;
  handleViewReason: (provider: string, reason: any) => void;
};

function StatusesOverview({
  govIdRetrievalEndpoints,
  consolidatedIdvSessionStatus,
  onfidoStatus,
  handleViewReason,
}: StatusOverviewProps) {
  const navigate = useNavigate();

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ fontWeight: "bold", width: "33.33%" }}>
          <p>Provider</p>
        </div>
        <div style={{ fontWeight: "bold", width: "33.33%" }}>
          <p>Status</p>
        </div>
        <div style={{ fontWeight: "bold", width: "33.33%" }}>
          <p>Action</p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ width: "33.33%" }}>
          <p>Veriff</p>
        </div>
        <div style={{ width: "33.33%" }}>
          <p>{consolidatedIdvSessionStatus?.veriff?.status ?? "n/a"}</p>
        </div>
        <div style={{ width: "33.33%" }}>
          {govIdRetrievalEndpoints?.veriff?.retrievalEndpoint ? (
            <button
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: "14px",
              }}
              onClick={() =>
                navigate(
                  `/issuance/idgov-veriff/store?sid=${
                    govIdRetrievalEndpoints?.veriff?.sid
                  }&retrievalEndpoint=${govIdRetrievalEndpoints?.veriff?.retrievalEndpoint}`
                )
              }
            >
              Finish Verification
            </button>
          ) : consolidatedIdvSessionStatus?.veriff?.status &&
            consolidatedIdvSessionStatus?.veriff?.status === "declined" ? (
            <button
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: "14px",
              }}
              onClick={() => {
                handleViewReason(
                  "Veriff",
                  consolidatedIdvSessionStatus?.veriff?.failureReason
                );
              }}
            >
              View Reason
            </button>
          ) : (
            <button
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: "14px",
              }}
              onClick={() => navigate("/issuance/idgov?provider=veriff")}
              disabled={
                !!consolidatedIdvSessionStatus?.veriff?.status &&
                consolidatedIdvSessionStatus?.veriff?.status !== "approved"
              }
            >
              Verify
            </button>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ width: "33.33%" }}>
          <p>iDenfy</p>
        </div>
        <div style={{ width: "33.33%" }}>
          <p>{consolidatedIdvSessionStatus?.idenfy?.status ?? "n/a"}</p>
        </div>
        <div style={{ width: "33.33%" }}>
          {govIdRetrievalEndpoints?.idenfy?.retrievalEndpoint ? (
            <button
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: "14px",
              }}
              onClick={() =>
                navigate(
                  `/issuance/idgov-idenfy/store?sid=${
                    govIdRetrievalEndpoints?.idenfy?.sid
                  }&retrievalEndpoint=${govIdRetrievalEndpoints?.idenfy?.retrievalEndpoint}`
                )
              }
            >
              Finish Verification
            </button>
          ) : consolidatedIdvSessionStatus?.idenfy?.status &&
            consolidatedIdvSessionStatus?.idenfy?.status === "DENIED" ? (
            <button
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: "14px",
              }}
              onClick={() => {
                handleViewReason(
                  "iDenfy",
                  consolidatedIdvSessionStatus?.idenfy?.failureReason ?? {}
                );
              }}
            >
              View Reason
            </button>
          ) : (
            <button
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: "14px",
              }}
              onClick={() => navigate("/issuance/idgov?provider=idenfy")}
              disabled={
                !!consolidatedIdvSessionStatus?.idenfy?.status &&
                consolidatedIdvSessionStatus?.idenfy?.status !== "APPROVED"
              }
            >
              Verify
            </button>
          )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ width: "33.33%" }}>
          <p>Onfido</p>
        </div>
        <div style={{ width: "33.33%" }}>
          <p>{onfidoStatus ?? "n/a"}</p>
        </div>
        <div style={{ width: "33.33%" }}>
          {govIdRetrievalEndpoints?.onfido?.retrievalEndpoint ? (
            <button
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: "14px",
              }}
              onClick={() =>
                navigate(
                  `/issuance/idgov-onfido/store?sid=${
                    govIdRetrievalEndpoints?.onfido?.sid
                  }&retrievalEndpoint=${govIdRetrievalEndpoints?.onfido?.retrievalEndpoint}`
                )
              }
            >
              Finish Verification
            </button>
          ) : consolidatedIdvSessionStatus?.onfido?.status &&
            onfidoStatus === "declined" ? (
            <button
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: "14px",
              }}
              onClick={() => {
                handleViewReason(
                  "Onfido",
                  consolidatedIdvSessionStatus?.onfido?.failureReason
                );
              }}
            >
              View Reason
            </button>
          ) : (
            <button
              className="profile-navigate-to-verification-button"
              style={{
                fontSize: "14px",
              }}
              onClick={() => navigate("/issuance/idgov?provider=onfido")}
              disabled={
                !!consolidatedIdvSessionStatus?.onfido?.status &&
                onfidoStatus !== "complete"
              }
            >
              Verify
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function VerificationFailureReason({
  provider,
  reason,
  handleClickBack,
}: {
  provider: string;
  reason: any;
  handleClickBack: () => void;
}) {
  let reasonStr: any = "";

  if (typeof reason === "string") {
    reasonStr = reason;
  } else if (Array.isArray(reason)) {
    reasonStr = reason.map((r, i) => (
      <Fragment key={i}>
        {r}
        <br />
      </Fragment>
    ));
  } else if (typeof reason === "object") {
    reasonStr = Object.entries(reason)
      .filter(
        ([_, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "" &&
          // @ts-ignore
          (value ?? []).length > 0
      )
      .map(([key, value], i) => (
        <Fragment key={i}>
          {/* @ts-ignore */}
          {key}: {Array.isArray(value) ? value.join(", ") : value}
          <br />
        </Fragment>
      ));
  }

  return (
    <>
      <p>
        Your verification with {provider} failed due to the following reasons.
      </p>
      <p style={{ color: "red" }}>{reasonStr}</p>

      <div style={{ marginTop: "20px" }}>
        <button
          className="export-private-info-button"
          style={{
            lineHeight: "1",
            fontSize: "16px",
          }}
          onClick={handleClickBack}
        >
          Back
        </button>
      </div>
    </>
  );
}

export default function VerificationStatusModal({
  isVisible,
  setIsVisible,
  consolidatedIdvSessionStatus,
  govIdRetrievalEndpoints,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  consolidatedIdvSessionStatus: Partial<SessionStatusResponse>;
  govIdRetrievalEndpoints: GovIdRetrievalEndpoints;
}) {
  const [page, setPage] = useState("overview"); // 'overview' | 'reason'
  const [reasonProps, setReasonProps] = useState({
    provider: "",
    reason: "",
  });

  // Onfido is slightly different since it separates status from result. To display
  // the failure "status" as a sinle string, we need to check both status and result.
  const onfidoStatus =
    consolidatedIdvSessionStatus?.onfido?.status === "complete" &&
    consolidatedIdvSessionStatus?.onfido?.result === "consider"
      ? "declined"
      : consolidatedIdvSessionStatus?.onfido?.status;

  const handleViewReason = (provider: string, reason: any) => {
    setReasonProps({
      provider,
      reason,
    });
    setPage("reason");
  };

  return (
    <>
      <Modal
        visible={isVisible}
        setVisible={setIsVisible}
        blur={true}
        heavyBlur={false}
        transparentBackground={false}
      >
        <div style={{ textAlign: "center", margin: "20px" }}>
          <h2>Government ID Verification Status</h2>
          {page === "overview" && (
            <StatusesOverview
              govIdRetrievalEndpoints={govIdRetrievalEndpoints}
              consolidatedIdvSessionStatus={consolidatedIdvSessionStatus}
              onfidoStatus={onfidoStatus}
              handleViewReason={handleViewReason}
            />
          )}

          {page === "reason" && (
            <VerificationFailureReason
              provider={reasonProps.provider}
              reason={reasonProps.reason}
              handleClickBack={() => setPage("overview")}
            />
          )}
        </div>
      </Modal>
    </>
  );
}
