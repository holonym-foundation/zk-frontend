import { Modal } from "../../atoms/Modal";
import { IssuedCredentialBase, IssuedCredentialMetadata } from "../../../types";

const ConfirmationModal = ({ 
  confirmationStatus,
  credsThatWillBeOverwritten,
  onConfirmOverwrite,
  onDenyOverwrite,
}: { 
  confirmationStatus: 'init' | 'confirmed' | 'denied' | 'confirmationRequired'
  credsThatWillBeOverwritten?: IssuedCredentialBase & Partial<{ metadata: IssuedCredentialMetadata }>
  onConfirmOverwrite: () => void
  onDenyOverwrite: () => void
}) => {
  return (
    <>
      <Modal
        // visible={confirmationModalVisible}
        visible={confirmationStatus === "confirmationRequired"}
        setVisible={() => {}}
        blur={true}
        heavyBlur={false}
        transparentBackground={false}
      >
        <div style={{ textAlign: "center" }}>
          <p>You already have credentials from this issuer.</p>
          <p>Would you like to overwrite them?</p>
          <div
            className="confirmation-modal-buttons"
            style={{
              marginTop: "10px",
              marginBottom: "10px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <button
              className="confirmation-modal-button-cancel"
              onClick={onDenyOverwrite}
            >
              No
            </button>
            <button
              className="confirmation-modal-button-confirm"
              onClick={onConfirmOverwrite}
            >
              Yes
            </button>
          </div>
          <p>You will not be able to undo this action.</p>
          <p>You would be overwriting...</p>
        </div>
        {JSON.stringify(
          credsThatWillBeOverwritten?.metadata?.rawCreds ??
            credsThatWillBeOverwritten,
          null,
          2
        )
          ?.replaceAll("}", "")
          ?.replaceAll("{", "")
          ?.replaceAll('"', "")
          ?.split(",")
          ?.map((cred, index) => (
            <p key={index}>
              <code>{cred}</code>
            </p>
          ))}
      </Modal>
    </>
  );
};

export default ConfirmationModal;
