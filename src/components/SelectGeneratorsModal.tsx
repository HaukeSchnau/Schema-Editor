import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import Modal from "react-modal";
import Generators from "../../generator/Generators";

interface SelectGeneratorsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onGenerate: (_gens: string[]) => void;
}

const SelectGeneratorsModal: React.FC<SelectGeneratorsModalProps> = ({
  isOpen,
  onRequestClose,
  onGenerate,
}) => {
  const [selectedGens, setSelectedGens] = useState<string[]>([]);

  useEffect(() => setSelectedGens([]), [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="modal-overlay"
      className="modal-content"
    >
      <h4>Für welche Plattformen möchtest du Code generieren?</h4>
      <ul>
        {Array.from(Generators.entries()).map(([id, Generator]) => (
          <li key={id}>
            <label>
              <input
                type="checkbox"
                onChange={(e) =>
                  e.target.checked
                    ? setSelectedGens((gens) => [...gens, id])
                    : setSelectedGens((gens) =>
                        gens.filter((genCandidateId) => genCandidateId !== id)
                      )
                }
              />
              {Generator.generatorName}
            </label>
          </li>
        ))}
      </ul>
      <button
        className="raised"
        type="submit"
        onClick={() => {
          onGenerate(selectedGens);
          onRequestClose();
        }}
      >
        Code Generieren!
      </button>
    </Modal>
  );
};

export default observer(SelectGeneratorsModal);
