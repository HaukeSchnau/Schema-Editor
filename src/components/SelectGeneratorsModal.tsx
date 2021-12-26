import React from "react";
import { observer } from "mobx-react";
import Generators from "../../generator/Generators";
import DialogModal from "./DialogModal";
import GeneratorMetaData from "../../model/generatorMetaData";
import Divider from "./Divider";

interface SelectGeneratorsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onGenerate: (_gens: string[]) => void;
  generatorsMetaData: Map<string, GeneratorMetaData>;
}

const SelectGeneratorsModal: React.FC<SelectGeneratorsModalProps> = ({
  isOpen,
  onRequestClose,
  onGenerate,
  generatorsMetaData,
}) => {
  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onRequestClose}
      heading="Für welche Plattformen möchtest du Code generieren?"
      confirmText="Code generieren!"
      onConfirm={() =>
        onGenerate(
          Array.from(generatorsMetaData.entries())
            .filter(([, metaData]) => metaData.export)
            .map(([id]) => id)
        )
      }
    >
      <ul>
        {Array.from(generatorsMetaData.entries()).map(([id, metaData], i) => (
          <React.Fragment key={id}>
            {i !== 0 && <Divider />}
            <li className="generator-config">
              <label>
                <input
                  type="checkbox"
                  checked={metaData.export}
                  onChange={(e) => {
                    metaData.export = e.target.checked;
                  }}
                />
                {Generators.get(id)?.generatorName ?? ""}
              </label>
              <label>
                Pfad (relativ zum Projekt-Wurzelverzeichnis):
                <input
                  className="highlighted ml-2"
                  disabled={!metaData.export}
                  size={0}
                  value={metaData.outDir}
                  onChange={(e) => {
                    metaData.outDir = e.target.value;
                  }}
                />
              </label>
            </li>
          </React.Fragment>
        ))}
      </ul>
    </DialogModal>
  );
};

export default observer(SelectGeneratorsModal);
