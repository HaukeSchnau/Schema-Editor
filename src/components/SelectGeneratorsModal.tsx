import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import Generators from "../../generator/Generators";
import DialogModal from "./DialogModal";

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
    <DialogModal
      isOpen={isOpen}
      onClose={onRequestClose}
      heading="Für welche Plattformen möchtest du Code generieren?"
      confirmText="Code generieren!"
      onConfirm={() => onGenerate(selectedGens)}
    >
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
    </DialogModal>
  );
};

export default observer(SelectGeneratorsModal);
