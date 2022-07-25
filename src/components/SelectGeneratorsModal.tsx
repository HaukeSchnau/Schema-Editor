/* eslint-disable no-underscore-dangle */
import React, { useState } from "react";
import { observer } from "mobx-react";
import { ZodObjectDef, ZodSchema } from "zod";
import { availableGenerators, GeneratorId } from "../generator/Generators";
import DialogModal from "./DialogModal";
import Divider from "./Divider";
import { GeneratorsType } from "../model/schema";
import ConfigOptions from "./ConfigOptions";

interface SelectGeneratorsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onGenerate: () => void;
  generators: GeneratorsType;
}

const SelectGeneratorsModal: React.FC<SelectGeneratorsModalProps> = ({
  isOpen,
  onRequestClose,
  onGenerate,
  generators,
}) => {
  const [selectedGenerator, setSelectedGenerator] = useState<GeneratorId>(
    Object.keys(availableGenerators)[0] as GeneratorId
  );

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onRequestClose}
      heading="Für welche Plattformen möchtest du Code generieren?"
      confirmText="Code generieren!"
      onConfirm={() => onGenerate()}
    >
      <div
        className="input-row"
        style={{ alignItems: "stretch", gap: "2rem", marginBlock: "2rem" }}
      >
        <select
          onChange={(e) => setSelectedGenerator(e.target.value as GeneratorId)}
          value={selectedGenerator}
          style={{ margin: 0, display: "flex", alignItems: "center" }}
        >
          {Object.keys(availableGenerators)
            .filter(
              (id) => !!availableGenerators[id as GeneratorId].generatorName
            )
            .map((id) => (
              <option key={id} value={id}>
                {availableGenerators[id as GeneratorId].generatorName ?? ""}
              </option>
            ))}
        </select>
        <button
          onClick={() => {
            const Generator = availableGenerators[selectedGenerator];
            if (!(selectedGenerator in generators)) {
              const configSchema = Generator.configSchema as ZodSchema<
                never,
                ZodObjectDef
              >;
              const shape = configSchema._def.shape();

              const defaults = Object.fromEntries(
                Object.entries(shape).map(([key, schema]) => [
                  key,
                  schema._def.defaultValue(),
                ])
              );

              generators[selectedGenerator] = defaults as never;
            }
          }}
          className="raised"
          type="button"
        >
          Hinzufügen
        </button>
      </div>
      <ul>
        {Object.entries(generators).map(([id, config], i) => (
          <React.Fragment key={id}>
            {i !== 0 && <Divider />}
            <li className="generator-config">
              <div style={{ display: "flex", alignItems: "center" }}>
                <h4>
                  {availableGenerators[id as GeneratorId].generatorName ?? ""}{" "}
                </h4>
                <button
                  type="button"
                  className="icon"
                  onClick={() => delete generators[id as GeneratorId]}
                >
                  ✕
                </button>
              </div>
              <ConfigOptions id={id as GeneratorId} config={config} />
            </li>
          </React.Fragment>
        ))}
      </ul>
    </DialogModal>
  );
};

export default observer(SelectGeneratorsModal);
