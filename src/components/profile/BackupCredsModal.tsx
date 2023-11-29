import { useMutation } from "@tanstack/react-query";
import { Modal } from "../atoms/Modal";
import { SessionStatusResponse } from "../../types";
import { getCredentials } from "../../utils/secrets";
import { useCreds } from "../../context/Creds";
import { useProofs } from "../../context/Proofs";
import { useHoloAuthSig } from "../../context/HoloAuthSig";
import { useHoloKeyGenSig } from "../../context/HoloKeyGenSig";


export default function VerificationStatusModal({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}) {
  const { sortedCreds, loadingCreds, storeCreds } = useCreds();
  const { loadKOLPProof, kolpProof } = useProofs();
  // const { holoAuthSigDigest } = useHoloAuthSig();
  // const { holoKeyGenSigDigest } = useHoloKeyGenSig();

  // useEffect(() => {
  //   // if (loadingCreds || !sortedCreds || !kolpProof) return;
  //   if (loadingCreds || !sortedCreds) return;
  //   (async function () {
  //     try {
  //       // Refetch and restore credentials
  //       await getCredentials(holoKeyGenSigDigest, holoAuthSigDigest, false)

  //       // const kolpProof = await loadKOLPProof()
  //       // await storeCreds(sortedCreds, kolpProof);
  //     } catch (err) {
  //       console.error('Error attempting to store creds', err)
  //     }
  //   })()
  // }, [sortedCreds, loadingCreds, kolpProof])

  const {
    mutate,
    isLoading,
    isError
  } = useMutation(
    async () => {
      if (!kolpProof) throw new Error('Missing necessary data: kolpProof')
      if (!sortedCreds) throw new Error('Missing necessary data: sortedCreds')
      try {
        // const kolpProof = await loadKOLPProof()
        await storeCreds(sortedCreds, kolpProof);
      } catch (err) {
        console.error('Error trying to backup creds', err)
        throw err
      }
    }
  )

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
          <h2>Backup Credentials</h2>
          <p>
            Backup your credentials if you want to generate proofs on a different device.
          </p>
          <div style={{ marginTop: "20px" }}>
            <button
              className="export-private-info-button"
              style={{
                lineHeight: "1",
                fontSize: "16px",
              }}
              disabled={isLoading}
              onClick={() => mutate()}
            >
              {isLoading ? 'Backing up credentials...' : 'Backup'}
            </button>

            {isError && (
              <p style={{ color: 'red', marginTop: '20px' }}>
                Encountered an error trying to backup credentials
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
