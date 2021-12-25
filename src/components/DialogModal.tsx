import React from "react";
import { observer } from "mobx-react";
import Modal from "react-modal";

interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  heading: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

const DialogModal: React.FC<DialogModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  heading,
  children,
  confirmText,
  cancelText,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="modal-overlay"
      className="modal-content"
    >
      <h4>{heading}</h4>
      {children}
      <div className="button-row mt-4">
        <button className="secondary" type="submit" onClick={onClose}>
          {cancelText ?? "Abbrechen"}
        </button>
        <button
          className="raised"
          type="submit"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText ?? "Bestätigen"}
        </button>
      </div>
    </Modal>
  );
};

export default observer(DialogModal);
