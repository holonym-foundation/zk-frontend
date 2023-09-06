/**
 * This component finishes the verification flow for any credential type.
 * It does 2 things (while displaying a loading message):
 * 1. Stores the new credentials.
 * 2. Adds to the Merkle tree a leaf containing the new credentials.
 */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  encryptWithAES,
  setLocalUserCredentials,
} from "../../../utils/secrets";
import { ThreeDots } from "react-loader-spinner";
import { Modal } from "../../atoms/Modal";
import TryDifferentIDVProvider from "../../atoms/TryDifferentIDVProvider";
import { useHoloKeyGenSig } from "../../../context/HoloKeyGenSig";
import { useCreds } from "../../../context/Creds";
import { useProofs } from "../../../context/Proofs";
import Relayer from "../../../utils/relayer";
import { onAddLeafProof } from "../../../utils/proofs";
import useRetrieveNewCredentials from "../../../hooks/IssuanceFinalStep/useRetrieveNewCredentials";
import useAddNewSecret from "../../../hooks/IssuanceFinalStep/useAddNewSecret";
import useMergeCreds from "../../../hooks/IssuanceFinalStep/useMergeCreds";
import ConfirmationModal from "./ConfirmationModal";
import RefundIDV from "./RefundIDV";
import { IssuedCredentialBase } from "../../../types";

// For test credentials, see id-server/src/main/utils/constants.js

export function useStoreCredentialsState({
  searchParams,
  setCredsForAddLeaf,
}: {
  searchParams: URLSearchParams;
  setCredsForAddLeaf: (creds: IssuedCredentialBase) => void;
}) {
  const [error, setError] = useState<string>();
  const [retrieveCredsError, setRetrieveCredsError] = useState<string>();
  const [status, setStatus] = useState("loading"); // 'loading' | 'success'
  const { sortedCreds, loadingCreds } = useCreds();
  const { holoKeyGenSigDigest } = useHoloKeyGenSig();
  const { newCreds } = useRetrieveNewCredentials({
    setError: setRetrieveCredsError,
    retrievalEndpoint: window.atob(searchParams.get("retrievalEndpoint") ?? ""),
  });
  const { newCredsWithNewSecret } = useAddNewSecret({
    retrievalEndpoint: window.atob(searchParams.get("retrievalEndpoint") ?? ""),
    newCreds,
  });
  const {
    confirmationStatus,
    credsThatWillBeOverwritten,
    mergedSortedCreds,
    onConfirmOverwrite,
    onDenyOverwrite,
  } = useMergeCreds({
    setError,
    sortedCreds: sortedCreds ?? {},
    loadingCreds,
    newCreds: newCredsWithNewSecret,
  });

  useEffect(() => {
    if (
      confirmationStatus === "confirmed" &&
      mergedSortedCreds &&
      newCreds?.creds?.issuerAddress
    ) {
      // Store creds. Encrypt with AES, using holoKeyGenSigDigest as the key.
      const encryptedCredentialsAES = encryptWithAES(
        mergedSortedCreds,
        holoKeyGenSigDigest
      );
      // Storing creds in localStorage at multiple points allows us to restore them in case of a (potentially immediate) re-render
      // window.localStorage.setItem(`holoPlaintextCreds-${searchParams.get('retrievalEndpoint')}`, JSON.stringify(newCreds))
      setLocalUserCredentials(encryptedCredentialsAES);
      setCredsForAddLeaf(mergedSortedCreds[newCreds.creds.issuerAddress]);
      setStatus("success");
    }
  }, [
    confirmationStatus,
    holoKeyGenSigDigest,
    mergedSortedCreds,
    newCreds?.creds?.issuerAddress,
    setCredsForAddLeaf,
  ]);

  return {
    retrieveCredsError,
    error,
    status,
    confirmationStatus,
    credsThatWillBeOverwritten,
    onConfirmOverwrite,
    onDenyOverwrite,
  };
}

export function useAddLeafState({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>();
  const status = useRef("idle"); // 'idle' | 'addingLeaf' | 'generatingKOLPProof' | 'backingUpCreds'
  const [credsForAddLeaf, setCredsForAddLeaf] =
    useState<IssuedCredentialBase>();
  const [readyToSendToServer, setReadyToSendToServer] = useState(false);
  const { reloadCreds, storeCreds } = useCreds();
  const { loadKOLPProof, kolpProof, loadProofs } = useProofs();

  const sendCredsToServer = useCallback(async () => {
    const sortedCredsTemp = await reloadCreds();
    const success = await storeCreds(sortedCredsTemp, kolpProof);
    if (!success) {
      setError("Error: Could not send credentials to server.");
    } else {
      // Remove plaintext credentials from local storage now that they've been backed up
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith("holoPlaintextCreds")) {
          window.localStorage.removeItem(key);
        }
      }
    }
  }, [kolpProof, reloadCreds, storeCreds]);

  const [leafExistsQueryRefetchInterval, setLeafExistsQueryRefetchInterval] = useState(Infinity)
  useQuery(
    ["leafExists", credsForAddLeaf?.newLeaf ?? ''],
    async () => Relayer.getLeafExists(credsForAddLeaf?.newLeaf ?? ''),
    {
      enabled: !!credsForAddLeaf?.newLeaf,
      refetchInterval: leafExistsQueryRefetchInterval,
      onSuccess: (data: { exists: boolean }) => {
        if (data?.exists) {
          loadKOLPProof(
            false,
            false,
            credsForAddLeaf!.creds.newSecret,
            credsForAddLeaf!.creds.serializedAsNewPreimage!
          );
          setReadyToSendToServer(true);
        }
      }
    }
  )

  const addLeaf = useCallback(async () => {
    const circomProof = await onAddLeafProof(credsForAddLeaf!);
    console.log("circom proof for adding leaf", circomProof);
    await Relayer.addLeaf(
      circomProof,
      async () => {
        status.current = "generatingKOLPProof";   
          
        setLeafExistsQueryRefetchInterval(2000)

        await queryClient.invalidateQueries(
          ["leafExists", credsForAddLeaf?.newLeaf ?? '']
        )
      },
      (err) => {
        // setError('Error: An error occurred while adding leaf to Merkle tree.')
        console.error(
          "useAddLeafState: An error occurred while adding leaf to Merkle tree:",
          err
        );
      }
    );
  }, [credsForAddLeaf, loadKOLPProof]);

  // Steps:
  // 1. Generate addLeaf proof and call relayer addLeaf endpoint
  // 2. Generate KOLP proof using creds in newly added leaf, send to server, and call onSuccess

  useEffect(() => {
    if (!credsForAddLeaf || status?.current === "addingLeaf") return;
    status.current = "addingLeaf";
    addLeaf();
  }, [addLeaf, credsForAddLeaf, status]);

  useEffect(() => {
    if (!(kolpProof && readyToSendToServer)) return;
    status.current = "backingUpCreds";
    sendCredsToServer().then(() => {
      onSuccess();
      loadProofs(true); // force a reload of all proofs since a new leaf has been added
    });
  }, [
    kolpProof,
    loadProofs,
    onSuccess,
    readyToSendToServer,
    sendCredsToServer,
  ]);

  return {
    error,
    status: status?.current,
    setCredsForAddLeaf,
  };
}

const FinalStep = ({ onSuccess }: { onSuccess: () => void }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      window.fathom.trackGoal("ROEMUCNU", 0);
    } catch (err) {
      console.log(err);
    }
  }, []);
  const [searchParams] = useSearchParams();
  const {
    error: addLeafError,
    status: addLeafStatus,
    setCredsForAddLeaf,
  } = useAddLeafState({ onSuccess });
  const {
    error: storeCredsError,
    retrieveCredsError,
    status: storeCredsStatus,
    confirmationStatus,
    credsThatWillBeOverwritten,
    onConfirmOverwrite,
    onDenyOverwrite,
  } = useStoreCredentialsState({ searchParams, setCredsForAddLeaf });
  const error = useMemo(
    () => addLeafError ?? storeCredsError ?? retrieveCredsError,
    [addLeafError, storeCredsError, retrieveCredsError]
  );
  // TODO: Display these messages in a nice progress bar. Maybe in the big progress bar?
  const loadingMessage = useMemo(() => {
    if (storeCredsStatus === "loading") return "Loading credentials";
    else if (
      storeCredsStatus === "success" &&
      (addLeafStatus === "idle" || addLeafStatus === "addingLeaf")
    )
      return "Adding leaf to Merkle tree";
    else if (addLeafStatus === "generatingKOLPProof") return "Generating proof";
    else if (addLeafStatus === "backingUpCreds")
      return "Backing up encrypted credentials";
  }, [storeCredsStatus, addLeafStatus]);

  return (
    <>
      <ConfirmationModal
        confirmationStatus={confirmationStatus}
        credsThatWillBeOverwritten={credsThatWillBeOverwritten}
        onConfirmOverwrite={onConfirmOverwrite}
        onDenyOverwrite={onDenyOverwrite}
      />
      {confirmationStatus === "denied" ? (
        <>
          <h3>Verification finalization aborted</h3>
          <p>
            Made a mistake? Please open a ticket in the{" "}
            <a
              href="https://discord.gg/2CFwcPW3Bh"
              target="_blank"
              rel="noreferrer"
              className="in-text-link"
            >
              #support-tickets
            </a>{" "}
            channel in the Holonym Discord with a description of your situation.
          </p>
        </>
      ) : error ? (
        <>
          <p style={{ color: "#f00", fontSize: "1.1rem" }}>{error}</p>
          {/* If the error is a retrieveCredsError, then we want to display "open a ticket" as an
              option next to "get a refund" */}
          {error && !retrieveCredsError && (
            <p>
              Please open a ticket in the{" "}
              <a
                href="https://discord.gg/2CFwcPW3Bh"
                target="_blank"
                rel="noreferrer"
                className="in-text-link"
              >
                #support-tickets
              </a>{" "}
              channel in the Holonym Discord with a description of the error.
            </p>
          )}
        </>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h3 style={{ textAlign: "center", paddingRight: "10px" }}>
              {loadingMessage}
            </h3>
            <ThreeDots
              height="20"
              width="40"
              radius="2"
              color="#FFFFFF"
              ariaLabel="three-dots-loading"
              wrapperStyle={{ marginBottom: "-20px" }}
              // wrapperClassName=""
              visible={true}
            />
          </div>
          {storeCredsStatus === "loading" && (
            <>
              {/* <p>Please sign the new messages in your wallet.</p> */}
              <p>Loading credentials could take a few seconds.</p>
            </>
          )}
        </>
      )}

      <RefundIDV retrieveCredsError={retrieveCredsError} />
    </>
  );
};

export default FinalStep;
