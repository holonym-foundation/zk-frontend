/**
 * This provider generates proofs and stores them in context and session storage.
 * NOTE: This provider must be a child of the signature providers because this
 * provider relies on the user's signatures.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import { isEqual } from "lodash";
import { useAccount } from "wagmi";
import Relayer from "../utils/relayer";
import { sha1String } from "../utils/misc";
import {
  onAddLeafProof,
  proofOfResidency,
  antiSybil,
  uniquenessPhone,
  proofOfMedicalSpecialty,
  proveGovIdFirstNameLastName,
  proveKnowledgeOfLeafPreimage,
} from "../utils/proofs";
import { serverAddress, defaultActionId } from "../constants";
import { useProofMetadata } from "./ProofMetadata";
// import ProofsWorker from "../web-workers/proofs.worker.js"; // Use worker in Webpack 4
import { useCreds } from "./Creds";
import { ProofContextType, IssuedCredentialBase } from "../types";

const Proofs = createContext<ProofContextType>({
  uniquenessProof: null,
  loadUniquenessProof: (
    runInMainThread?: boolean | undefined,
    forceReload?: boolean | undefined
  ) => Promise.resolve(),
  loadingUniquenessProof: false,
  uniquenessPhoneProof: null,
  loadUniquenessPhoneProof: (
    runInMainThread?: boolean | undefined,
    forceReload?: boolean | undefined
  ) => Promise.resolve(),
  loadingUniquenessPhoneProof: false,
  usResidencyProof: null,
  loadUSResidencyProof: (
    runInMainThread?: boolean | undefined,
    forceReload?: boolean | undefined
  ) => Promise.resolve(),
  loadingUSResidencyProof: false,
  medicalSpecialtyProof: null,
  loadMedicalSpecialtyProof: (
    runInMainThread?: boolean | undefined,
    forceReload?: boolean | undefined
  ) => Promise.resolve(),
  loadingMedicalSpecialtyProof: false,
  govIdFirstNameLastNameProof: null,
  loadGovIdFirstNameLastNameProof: (
    runInMainThread?: boolean | undefined,
    forceReload?: boolean | undefined
  ) => Promise.resolve(),
  loadingGovIdFirstNameLastNameProof: false,
  kolpProof: null,
  loadKOLPProof: (
    runInMainThread?: boolean | undefined,
    forceReload?: boolean | undefined
  ) => Promise.resolve(),
  loadingKOLPProof: false,
  loadProofs: (suggestForceReload?: boolean | undefined) => Promise.resolve(),
});

// Use worker in Webpack 5
const proofsWorker = window.Worker
  ? new Worker(new URL("../web-workers/proofs.worker.js", import.meta.url), {
    type: 'module',
  })
  : null;

// Use worker in Webpack 4
// const proofsWorker = window.Worker ? new ProofsWorker() : null;

function ProofsProvider({ children }: { children: React.ReactNode }) {
  const [uniquenessProof, setUniquenessProof] = useState<any>(null);
  const [loadingUniquenessProof, setLoadingUniquenessProof] = useState(false);
  const [uniquenessPhoneProof, setUniquenessPhoneProof] = useState<any>(null);
  const [loadingUniquenessPhoneProof, setLoadingUniquenessPhoneProof] =
    useState(false);
  const [usResidencyProof, setUSResidencyProof] = useState<any>(null);
  const [loadingUSResidencyProof, setLoadingUSResidencyProof] = useState(false);
  const [medicalSpecialtyProof, setMedicalSpecialtyProof] = useState<any>(null);
  const [loadingMedicalSpecialtyProof, setLoadingMedicalSpecialtyProof] =
    useState(false);
  const [govIdFirstNameLastNameProof, setGovIdFirstNameLastNameProof] =
    useState<any>(null);
  const [
    loadingGovIdFirstNameLastNameProof,
    setLoadingGovIdFirstNameLastNameProof,
  ] = useState(false);
  const [kolpProof, setKOLPProof] = useState<any>(null);
  const [loadingKOLPProof, setLoadingKOLPProof] = useState(false);
  const [sortedCredsDigest, setSortedCredsDigest] = useState<string | null>(
    null
  );
  // numQueuedStoreCredsInvocations is the number of times storeCreds has been queued for
  // invocation. This allows us to trigger a specific number of calls to storeCreds and
  // ensure that storeCreds is called only when sortedCreds and kolpProof are populated.
  const [numQueuedStoreCredsInvocations, setNumQueuedStoreCredsInvocations] =
    useState(0);
  const { data: account } = useAccount();
  const { proofMetadata, loadingProofMetadata } = useProofMetadata();
  const { sortedCreds, loadingCreds, storeCreds } = useCreds();
  const prevSortedCredsRef = useRef(sortedCreds);
  const location = useLocation();

  // TODO: Low priority: Maybe: Add onAddLeafProof to this context

  /**
   * @param suggestForceReload - If true, proofs will be reloaded even if they are already loaded
   * and even if they are currently being loaded UNLESS sortedCreds is the same as it was the last time
   * this function was called.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function loadProofs(suggestForceReload: boolean = false) {
    if (loadingProofMetadata || loadingCreds || !sortedCreds) return;
    if (
      location.pathname.includes("issuance") &&
      location.pathname.includes("store")
    ) {
      // Do not load proofs if the user is at the end of the issuance flow. We include this check
      // mainly to prevent a race condition between the calls to addLeaf (the one in this context
      // and the one in the issuance/FinalStep component). This check also prevents the unnecessary
      // loading of proofs that will need to be re-loaded once the user completes the issuance flow.
      // Note that we do not include this check in the individual loadXProof functions because
      // we want the issuance flow to be able to trigger the loading of individual proofs.
      return;
    }
    if (
      sortedCredsDigest &&
      sortedCredsDigest === (await sha1String(JSON.stringify(sortedCreds)))
    ) {
      return;
    }
    setSortedCredsDigest(await sha1String(JSON.stringify(sortedCreds)));
    // Figure out which proofs the user doesn't already have. Then load them
    // if the user has the credentials to do so.
    const missingProofs = {
      uniqueness: !uniquenessProof,
      "uniqueness-phone": !uniquenessPhoneProof,
      "us-residency": !usResidencyProof,
      "medical-specialty": !medicalSpecialtyProof,
      "gov-id-firstname-lastname": !govIdFirstNameLastNameProof, // Not an SBT. No good way to determine whether user needs it, so always generate
      kolp: !kolpProof, // Not an SBT. Always needed
    };
    if (proofMetadata) {
      for (const proofMetadataItem of proofMetadata) {
        if (proofMetadataItem?.proofType === "us-residency") {
          missingProofs["us-residency"] = false;
        } else if (proofMetadataItem?.proofType === "uniqueness") {
          missingProofs["uniqueness"] = false;
        } else if (proofMetadataItem?.proofType === "uniqueness-phone") {
          missingProofs["uniqueness-phone"] = false;
        } else if (proofMetadataItem?.proofType === "medical-specialty") {
          missingProofs["medical-specialty"] = false;
        }
      }
    }
    if (!sortedCreds) return;

    if (suggestForceReload || (missingProofs.kolp && !loadingKOLPProof)) {
      setLoadingKOLPProof(true);
      loadKOLPProof(false, suggestForceReload);
    }
    if (
      suggestForceReload ||
      (missingProofs.uniqueness && !loadingUniquenessProof)
    ) {
      setLoadingUniquenessProof(true);
      loadUniquenessProof(false, suggestForceReload);
    }
    if (
      suggestForceReload ||
      (missingProofs["uniqueness-phone"] && !loadingUniquenessPhoneProof)
    ) {
      setLoadingUniquenessPhoneProof(true);
      loadUniquenessPhoneProof(false, suggestForceReload);
    }
    if (
      suggestForceReload ||
      (missingProofs["us-residency"] && !loadingUSResidencyProof)
    ) {
      setLoadingUSResidencyProof(true);
      loadUSResidencyProof(false, suggestForceReload);
    }
    if (
      suggestForceReload ||
      (missingProofs["gov-id-firstname-lastname"] &&
        !loadingGovIdFirstNameLastNameProof)
    ) {
      setLoadingGovIdFirstNameLastNameProof(true);
      loadGovIdFirstNameLastNameProof(false, suggestForceReload);
    }
    if (
      suggestForceReload ||
      (missingProofs["medical-specialty"] && !loadingMedicalSpecialtyProof)
    ) {
      setLoadingMedicalSpecialtyProof(true);
      loadMedicalSpecialtyProof(false, suggestForceReload);
    }
  }

  /**
   * @param creds An object from an issuer (not a sortedCreds object).
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function addLeaf(creds: IssuedCredentialBase) {
    const circomProof = await onAddLeafProof(creds);
    await Relayer.addLeaf(circomProof, async () => {
      loadKOLPProof(
        false,
        false,
        creds.creds.newSecret,
        creds.creds.serializedAsNewPreimage
      );
      if (sortedCreds && kolpProof) storeCreds(sortedCreds, kolpProof);
      else {
        setNumQueuedStoreCredsInvocations(numQueuedStoreCredsInvocations + 1);
      }
    });
  }

  useEffect(() => {
    if (numQueuedStoreCredsInvocations > 0 && sortedCreds && kolpProof) {
      setNumQueuedStoreCredsInvocations(numQueuedStoreCredsInvocations - 1);
      storeCreds(sortedCreds, kolpProof);
    }
  }, [numQueuedStoreCredsInvocations, sortedCreds, kolpProof, storeCreds]);

  /**
   * Load anti-sybil proof (based on government ID) into context.
   * @param runInMainThread - Whether to generate the proof in the main thread. Prefer false because
   * running in main thread could result in the page freezing while proof is generating.
   */
  async function loadUniquenessProof(
    runInMainThread = false,
    forceReload = false
  ) {
    const govIdCreds = sortedCreds?.[serverAddress["idgov-v2"]];
    if (!govIdCreds) return;
    if (!runInMainThread && proofsWorker) {
      proofsWorker.postMessage({
        message: "uniqueness",
        govIdCreds,
        userAddress: account!.address,
        actionId: defaultActionId,
        forceReload,
      });
    }
    if (runInMainThread) {
      try {
        const proof = await antiSybil(
          account!.address!,
          govIdCreds,
          defaultActionId
        );
        setUniquenessProof(proof);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUniquenessProof(false);
      }
    }
  }

  /**
   * Load anti-sybil proof (based on phone number) into context.
   * @param runInMainThread - Whether to generate the proof in the main thread. Prefer false because
   * running in main thread could result in the page freezing while proof is generating.
   */
  async function loadUniquenessPhoneProof(
    runInMainThread = false,
    forceReload = false
  ) {
    const phoneNumCreds = sortedCreds?.[serverAddress["phone-v2"]];
    if (!phoneNumCreds) return;
    if (!runInMainThread && proofsWorker) {
      proofsWorker.postMessage({
        message: "uniqueness-phone",
        phoneNumCreds,
        userAddress: account!.address,
        actionId: defaultActionId,
        forceReload,
      });
    }
    if (runInMainThread) {
      try {
        const proof = await uniquenessPhone(
          account!.address!,
          phoneNumCreds,
          defaultActionId
        );
        setUniquenessPhoneProof(proof);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUniquenessPhoneProof(false);
      }
    }
  }

  /**
   * Load proof of residency proof into context.
   * @param runInMainThread - Whether to generate the proof in the main thread. Prefer false because
   * running in main thread could result in the page freezing while proof is generating.
   */
  async function loadUSResidencyProof(
    runInMainThread = false,
    forceReload = false
  ) {
    const govIdCreds = sortedCreds?.[serverAddress["idgov-v2"]];
    if (!govIdCreds) return;
    if (proofsWorker && !runInMainThread) {
      proofsWorker.postMessage({
        message: "us-residency",
        userAddress: account!.address,
        govIdCreds,
        forceReload,
      });
    }
    if (runInMainThread) {
      try {
        const proof = await proofOfResidency(account!.address!, govIdCreds);
        setUSResidencyProof(proof);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUSResidencyProof(false);
      }
    }
  }

  /**
   * Load medical specialty proof into context.
   * @param runInMainThread - Whether to generate the proof in the main thread. Prefer false because
   * running in main thread could result in the page freezing while proof is generating.
   */
  async function loadMedicalSpecialtyProof(
    runInMainThread = false,
    forceReload = false
  ) {
    // We have commented this out because it was used for medical credentials issuance,
    // which we have stopped supporting.
    // const medicalCreds = sortedCreds?.[serverAddress['med']]
    // if (!medicalCreds) return;
    // if (proofsWorker && !runInMainThread) {
    //   proofsWorker.postMessage({
    //     message: "medical-specialty",
    //     userAddress: account.address,
    //     medicalCreds,
    //     forceReload,
    //   });
    // }
    // if (runInMainThread) {
    //   try {
    //     const proof = await proofOfMedicalSpecialty(account.address, medicalCreds);
    //     setMedicalSpecialtyProof(proof);
    //   } catch (err) {
    //     console.error(err)
    //   } finally {
    //     setLoadingMedicalSpecialtyProof(false);
    //   }
    // }
  }

  async function loadGovIdFirstNameLastNameProof(
    runInMainThread = false,
    forceReload = false
  ) {
    // We have commented this out because it was used for medical credentials issuance,
    // which we have stopped supporting.
    // const govIdCreds = sortedCreds?.[serverAddress['idgov-v2']]
    // if (!govIdCreds) return;
    // if (proofsWorker && !runInMainThread) {
    //   proofsWorker.postMessage({
    //     message: "gov-id-firstname-lastname",
    //     govIdCreds,
    //     forceReload,
    //   });
    // }
    // if (runInMainThread) {
    //   try {
    //     const proof = await proveGovIdFirstNameLastName(govIdCreds);
    //     setGovIdFirstNameLastNameProof(proof);
    //   } catch (err) {
    //     console.error(err)
    //   } finally {
    //     setLoadingGovIdFirstNameLastNameProof(false);
    //   }
    // }
  }

  async function loadKOLPProof(
    runInMainThread: boolean = false,
    forceReload: boolean = false,
    newSecret: string | null = null,
    serializedAsNewPreimage: Array<string> | null = null
  ) {
    const govIdCreds = sortedCreds?.[serverAddress["idgov-v2"]];
    const phoneNumCreds = sortedCreds?.[serverAddress["phone-v2"]];
    if (
      !((newSecret && serializedAsNewPreimage) || govIdCreds || phoneNumCreds)
    )
      return;
    if (proofsWorker && !runInMainThread) {
      if (newSecret && serializedAsNewPreimage) {
        proofsWorker.postMessage({
          message: "kolp",
          newSecret,
          serializedAsNewPreimage,
          forceReload,
        });
      }
      // We just need one KOLP proof. The proof is only used by storage server to verify that
      // the request is in fact from a Holonym user.
      else if (govIdCreds?.creds?.serializedAsNewPreimage) {
        proofsWorker.postMessage({
          message: "kolp",
          newSecret: govIdCreds.creds.newSecret,
          serializedAsNewPreimage: govIdCreds.creds.serializedAsNewPreimage,
          forceReload,
        });
      } else if (phoneNumCreds?.creds?.serializedAsNewPreimage) {
        proofsWorker.postMessage({
          message: "kolp",
          newSecret: phoneNumCreds.creds.newSecret,
          serializedAsNewPreimage: phoneNumCreds.creds.serializedAsNewPreimage,
          forceReload,
        });
      }
    }
    if (runInMainThread) {
      try {
        if (govIdCreds?.creds?.serializedAsNewPreimage) {
          const proof = await proveKnowledgeOfLeafPreimage(
            govIdCreds?.creds?.serializedAsNewPreimage,
            govIdCreds?.creds?.newSecret!
          );
          setKOLPProof(proof);
        } else if (phoneNumCreds?.creds?.serializedAsNewPreimage) {
          const proof = await proveKnowledgeOfLeafPreimage(
            phoneNumCreds?.creds?.serializedAsNewPreimage,
            phoneNumCreds?.creds?.newSecret!
          );
          setKOLPProof(proof);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingKOLPProof(false);
      }
    }
  }

  useEffect(
    () => {
      if (proofsWorker) {
        proofsWorker.onmessage = async (event: any) => {
          if (event?.data?.error) {
            console.error(event.data.error);
            // If proof failed because leaf isn't in tree, call addLeaf. This handles the case where the
            // user retrieved their credentials but something failed during the add leaf process.
            // Reload proofs after adding leaf. The proof that erred should then succeed.
            if (event.data.error?.message === "Leaf is not in Merkle tree") {
              if (
                event.data.proofType === "us-residency" ||
                event.data.proofType === "uniqueness"
              ) {
                if (sortedCreds?.[serverAddress["idgov-v2"]]) {
                  await addLeaf(sortedCreds[serverAddress["idgov-v2"]]);
                  loadUSResidencyProof(false, true);
                  loadUniquenessProof(false, true);
                  loadGovIdFirstNameLastNameProof(false, true);
                  loadKOLPProof(false, true);
                }
              } else if (event.data.proofType === "uniqueness-phone") {
                if (sortedCreds?.[serverAddress["phone-v2"]]) {
                  await addLeaf(sortedCreds[serverAddress["phone-v2"]]);
                  loadUniquenessPhoneProof(false, true);
                }
              } else if (event.data.proofType === "medical-specialty") {
                if (sortedCreds?.[serverAddress["med"]]) {
                  await addLeaf(sortedCreds[serverAddress["med"]]);
                  loadMedicalSpecialtyProof(false, true);
                }
              }
            }
          } else if (event?.data?.proofType === "us-residency") {
            setUSResidencyProof(event.data.proof);
            setLoadingUSResidencyProof(false);
          } else if (event?.data?.proofType === "uniqueness") {
            setUniquenessProof(event.data.proof);
            setLoadingUniquenessProof(false);
          } else if (event?.data?.proofType === "uniqueness-phone") {
            setUniquenessPhoneProof(event.data.proof);
            setLoadingUniquenessPhoneProof(false);
          } else if (event?.data?.proofType === "medical-specialty") {
            setMedicalSpecialtyProof(event.data.proof);
            setLoadingMedicalSpecialtyProof(false);
          } else if (event?.data?.proofType === "gov-id-firstname-lastname") {
            setGovIdFirstNameLastNameProof(event.data.proof);
            setLoadingGovIdFirstNameLastNameProof(false);
          } else if (event?.data?.proofType === "kolp") {
            setKOLPProof(event.data.proof);
            setLoadingKOLPProof(false);
          }
        };
      }
      // Force a reload of the proofs if sortedCreds has actually changed. Otherwise just load
      // proofs that haven't yet been loaded.
      const forceReload = !isEqual(sortedCreds, prevSortedCredsRef.current);
      loadProofs(forceReload);

      prevSortedCredsRef.current = sortedCreds;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      proofMetadata,
      loadingProofMetadata,
      sortedCreds,
      loadingCreds,
      location,
      addLeaf,
      loadProofs,
    ]
  );

  return (
    <Proofs.Provider
      value={{
        uniquenessProof,
        loadUniquenessProof,
        loadingUniquenessProof,
        uniquenessPhoneProof,
        loadUniquenessPhoneProof,
        loadingUniquenessPhoneProof,
        usResidencyProof,
        loadUSResidencyProof,
        loadingUSResidencyProof,
        medicalSpecialtyProof,
        loadMedicalSpecialtyProof,
        loadingMedicalSpecialtyProof,
        govIdFirstNameLastNameProof,
        loadGovIdFirstNameLastNameProof,
        loadingGovIdFirstNameLastNameProof,
        kolpProof,
        loadKOLPProof,
        loadingKOLPProof,
        loadProofs, // load all proofs
      }}
    >
      {children}
    </Proofs.Provider>
  );
}

// Helper hook to access the provider values
const useProofs = () => useContext(Proofs);

export { ProofsProvider, useProofs };
