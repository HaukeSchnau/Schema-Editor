import React, { useState } from "react";
import { observer } from "mobx-react";
import { useDrop } from "react-dnd";
import Model from "../../model/model";
import Property from "../../model/property";
import PropertyView from "./PropertyView";
import { useStore } from "../../model/rootStore";
import ModelStage from "./ModelStage";
import DialogModal from "./DialogModal";
import Card from "./Card";

interface ModelViewProps {
  model: Model;
}

const ModelView: React.FC<ModelViewProps> = ({ model }) => {
  const { loadedSchema } = useStore();
  const [, drop] = useDrop(() => ({
    accept: "model",
    drop: (item: Model, monitor) => {
      if (monitor.didDrop()) return;
      model.addChild(item);
    },
  }));

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onDelete = () => {
    if (!loadedSchema) throw new Error("No schema loaded");
    model.deleteFromTree();
  };

  return (
    <Card ref={drop}>
      <div className="input-row">
        <input
          className="heading"
          value={model.name}
          placeholder="(kein Name)"
          onChange={(e) => {
            model.name = e.target.value;
          }}
          size={1}
        />

        <button
          type="button"
          className="icon"
          onClick={() => setDeleteDialogOpen(true)}
        >
          ✕
        </button>
      </div>
      <ul className="grow">
        {model.properties.map((prop, i) => (
          <PropertyView
            key={prop.id}
            prop={prop}
            onDelete={() => model.properties.splice(i, 1)}
          />
        ))}
      </ul>
      <button
        type="button"
        className="raised right dense mt-4"
        onClick={() => model.properties.push(new Property(""))}
      >
        + Eigenschaft hinzufügen
      </button>
      <ModelStage parent={model} />
      <DialogModal
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={onDelete}
        confirmText="Löschen"
        heading={
          <>
            Möchtest du das Model {model.name} und all seine untergeordneten
            Models wirklich löschen?
          </>
        }
      />
    </Card>
  );
};

export default observer(ModelView);
