import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import { useQueries, QueryFunctionContext } from "@tanstack/react-query";
import { InfoButton } from "../info-button";
import ColoredHorizontalRule from "../atoms/ColoredHorizontalRule";
import { serverAddress, idServerUrl } from "../../constants";
import useIdvSessionStatus from "../../hooks/useIdvSessionStatus";
import useIdServerSessions from "../../hooks/useIdServerSessions";
import VerificationStatusModal from "./VerificationStatusModal";
import BackupCredsModal from "./BackupCredsModal";
import { SessionStatusResponse } from '../../types';

const issuerAddrToName = Object.fromEntries(
  Object.values(serverAddress).map((addr) => [addr, "Holonym"])
);

const govIdCredNames = [
  "First Name",
  "Middle Name",
  "Last Name",
  "Birthdate",
  "Street Number",
  "Street Name",
  "Street Unit",
  "City",
  "Subdivision",
  "Zip Code",
  "Country",
];

const medicalCredNames = [
  "Medical Credentials",
  "Medical Specialty",
  // 'License',
  "NPI Number",
];

const VerifyButton = ({
  onClick,
  text,
}: {
  onClick: () => void;
  text: string;
}) => (
  <button onClick={onClick} className="profile-verify-button">
    {text}
  </button>
);

export default function PrivateInfoCard({
  creds,
  loading,
}: {
  creds: any;
  loading: boolean;
}) {
  const navigate = useNavigate();
  const [statusModalIsVisible, setStatusModalIsVisible] = useState(false);
  const [backupCredsModalIsVisible, setBackupCredsModalIsVisible] = useState(false);

  const { data: idServerSessions } = useIdServerSessions();
  // const { data: idvSessionStatus } = useIdvSessionStatus();
  const idvSessionStatusQueryFn = async (context: QueryFunctionContext) => {
    const [_, sid] = context.queryKey;
    if (!sid) return {};
    const url = `${idServerUrl}/session-status/v2?sid=${sid}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to get session status. Response status code: ${resp.status}`);
    }
    return resp.json();
  }

  const idvSessionStatuses = useQueries({
    queries: (idServerSessions ?? []).filter(
      (session) => session.status === "IN_PROGRESS"
    ).map((session) => ({
      queryKey: ['idvSessionStatus', session._id],
      queryFn: idvSessionStatusQueryFn,
      staleTime: Infinity
    }))
  })

  const consolidatedIdvSessionStatus = useMemo(() => {
    if (!idvSessionStatuses) return {} as SessionStatusResponse;

    // Filter out unapproved sessions
    idvSessionStatuses.filter((statusData) => {
      if (!statusData.data) return false;
      if (statusData.data.veriff?.status === "approved") return true;
      if (statusData.data.idenfy?.status === "APPROVED") return true;
      if (
        statusData.data.onfido?.status === "complete" &&
        statusData.data.onfido?.result === "clear"
      )
        return true;
      return false;
    })

    // Merge all approved sessions into one object
    const idvSessionStatus: SessionStatusResponse = idvSessionStatuses.reduce(
      (acc, statusData) => {
        if (!statusData.data) return acc;
        return {
          ...acc,
          ...statusData.data
        }
      }, 
      {} as SessionStatusResponse
    )
    return idvSessionStatus;
  }, [idvSessionStatuses])

  const govIdRetrievalEndpoints = useMemo(() => {
    if (!consolidatedIdvSessionStatus) return {};
    const endpoints: {
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
    } = {};
    if (consolidatedIdvSessionStatus?.veriff?.status === "approved") {
      const retrievalEndpoint = `${idServerUrl}/veriff/credentials?sessionId=${consolidatedIdvSessionStatus?.veriff?.sessionId}`;
      endpoints.veriff = {
        sid: consolidatedIdvSessionStatus?.veriff?.sid,
        retrievalEndpoint: encodeURIComponent(window.btoa(retrievalEndpoint))
      }
    }
    if (consolidatedIdvSessionStatus?.idenfy?.status === "APPROVED") {
      const retrievalEndpoint = `${idServerUrl}/idenfy/credentials?scanRef=${consolidatedIdvSessionStatus?.idenfy?.scanRef}`;
      endpoints.idenfy = {
        sid: consolidatedIdvSessionStatus?.idenfy?.sid,
        retrievalEndpoint: encodeURIComponent(window.btoa(retrievalEndpoint))
      }
    }
    if (
      consolidatedIdvSessionStatus?.onfido?.status === "complete" &&
      consolidatedIdvSessionStatus?.onfido?.result === "clear"
    ) {
      const retrievalEndpoint = `${idServerUrl}/onfido/credentials?check_id=${consolidatedIdvSessionStatus?.onfido?.check_id}`;
      endpoints.onfido = {
        sid: consolidatedIdvSessionStatus?.onfido?.sid,
        retrievalEndpoint: encodeURIComponent(window.btoa(retrievalEndpoint))
      }
    }
    return endpoints;
  }, [idvSessionStatuses]);

  const govIdRetrievalEndpoint = useMemo(() => {
    if (Object.keys(govIdRetrievalEndpoints).length === 1) {
      return Object.values(govIdRetrievalEndpoints)[0];
    }
  }, [govIdRetrievalEndpoints]);

  // Regarding UX of verification session statuses...
  // - If they have 1 successful session and no other session, simply display a link
  //   to finalize verification.
  // - Otherwise, let them open a modal to view verification statuses for each provider.

  return (
    <>
      <VerificationStatusModal
        isVisible={statusModalIsVisible}
        setIsVisible={setStatusModalIsVisible}
        consolidatedIdvSessionStatus={consolidatedIdvSessionStatus}
        govIdRetrievalEndpoints={govIdRetrievalEndpoints}
      />
      <BackupCredsModal
        isVisible={backupCredsModalIsVisible}
        setIsVisible={setBackupCredsModalIsVisible}
      />

      <div className="profile-info-card">
        {loading ? (
          <Oval
            // height={100}
            // width={100}
            color="white"
            wrapperStyle={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="#060612" // matches card background
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        ) : (
          <>
            <div className="card-header" style={{ display: "flex" }}>
              <div>
                <h2 className="card-header-title">Your Holo</h2>
                <div style={{ display: "flex" }}>
                  <p>
                    This is kept locally and privately. Only you can see it.
                  </p>
                  <div
                    style={{
                      marginBottom: "12px",
                      position: "relative",
                      top: "-4px",
                      left: "-4px",
                    }}
                  >
                    <InfoButton
                      type="inPlace"
                      text={
                        "Data is stored locally and a backup is encrypted and stored in a backup server access-gated by your wallet signature. This server may be replaced with decentralized storage. Nobody can see your data except you."
                      }
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <button
                  className='export-private-info-button'
                  // className='backup-credentials-button'
                  // className='profile-navigate-to-verification-button'
                  style={{ padding: "20px" }}
                  onClick={() => setBackupCredsModalIsVisible(true)}
                >
                  Backup Credentials
                </button>
              </div>
            </div>
            <ColoredHorizontalRule />
            <div className="card-content">
              <div className="private-info-grid">
                <div
                  style={{ fontWeight: "bold" }}
                  className="private-info-attribute-name"
                >
                  Attribute
                </div>
                <div
                  style={{ fontWeight: "bold" }}
                  className="private-info-attribute-value"
                >
                  Value
                </div>
                <div
                  style={{ fontWeight: "bold" }}
                  className="private-info-attribute-date-issued"
                >
                  Date issued
                </div>
                <div
                  style={{ fontWeight: "bold" }}
                  className="private-info-attribute-issuer"
                >
                  Issuer
                </div>

                {creds &&
                Object.keys(creds).filter((item) =>
                  govIdCredNames.includes(item)
                ).length > 0 ? (
                  Object.keys(creds)
                    .filter((item) => govIdCredNames.includes(item))
                    .map((credName, index) => (
                      // TODO: Fix: Warning: Each child in a list should have a unique "key" prop.
                      <>
                        <div className="private-info-attribute-name">
                          {credName}
                        </div>
                        <div className="private-info-attribute-value">
                          {creds[credName]?.cred}
                        </div>
                        <div className="private-info-attribute-date-issued">
                          {creds[credName]?.iat}
                        </div>
                        <div className="private-info-attribute-issuer">
                          {issuerAddrToName[creds[credName]?.issuer] ??
                            creds[credName]?.issuer}
                        </div>
                      </>
                    ))
                ) : govIdRetrievalEndpoint?.retrievalEndpoint ? (
                  <>
                    <div className="private-info-attribute-name">
                      Government ID
                    </div>
                    <VerifyButton
                      onClick={() =>
                        navigate(
                          `/issuance/idgov-veriff/store?sid=${
                            govIdRetrievalEndpoint?.retrievalEndpoint
                          }&retrievalEndpoint=${govIdRetrievalEndpoint?.retrievalEndpoint}`
                        )
                      }
                      text="Your Government ID credentials are ready - Click here to complete issuance"
                    />
                  </>
                ) : consolidatedIdvSessionStatus?.veriff?.status ||
                  consolidatedIdvSessionStatus?.idenfy?.status ||
                  consolidatedIdvSessionStatus?.onfido?.status ? (
                  <>
                    <div className="private-info-attribute-name">
                      Government ID
                    </div>
                    <VerifyButton
                      onClick={() => setStatusModalIsVisible(true)}
                      text="View Government ID Verification Status"
                    />
                  </>
                ) : (
                  <>
                    <div className="private-info-attribute-name">
                      Government ID
                    </div>
                    <VerifyButton
                      onClick={() => navigate("/issuance/idgov-prereqs")}
                      text="Verify Government ID"
                    />
                  </>
                )}

                {creds?.["Phone Number"] ? (
                  <>
                    <div className="private-info-attribute-name">
                      Phone Number
                    </div>
                    <div className="private-info-attribute-value">
                      {creds["Phone Number"]?.cred}
                    </div>
                    <div className="private-info-attribute-date-issued">
                      {creds?.["Phone Number"]?.iat}
                    </div>
                    <div className="private-info-attribute-issuer">
                      {issuerAddrToName[creds?.["Phone Number"]?.issuer] ??
                        creds?.["Phone Number"]?.issuer}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="private-info-attribute-name">
                      Phone Number
                    </div>
                    <VerifyButton
                      onClick={() => navigate("/issuance/phone-prereqs")}
                      text="Verify Phone Number"
                    />
                  </>
                )}

                {creds &&
                Object.keys(creds).filter((item) =>
                  medicalCredNames.includes(item)
                ).length > 0
                  ? Object.keys(creds)
                      .filter((item) => medicalCredNames.includes(item))
                      .map((credName, index) => (
                        // TODO: Fix: Warning: Each child in a list should have a unique "key" prop.
                        <>
                          <div className="private-info-attribute-name">
                            {credName}
                          </div>
                          <div className="private-info-attribute-value">
                            {creds[credName]?.cred}
                          </div>
                          <div className="private-info-attribute-date-issued">
                            {creds[credName]?.iat}
                          </div>
                          <div className="private-info-attribute-issuer">
                            {issuerAddrToName[creds[credName]?.issuer] ??
                              creds[credName]?.issuer}
                          </div>
                        </>
                      ))
                  : null}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
