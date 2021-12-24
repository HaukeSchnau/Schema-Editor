import React from "react";
import { observer } from "mobx-react";
import Model from "../../model/model";
import Property from "../../model/property";
import PropertyView from "./PropertyView";

interface ModelViewProps {
  model: Model;
}

const ModelView: React.FC<ModelViewProps> = ({ model }) => {
  return (
    <div className="card">
      <input
        className="heading"
        value={model.name}
        placeholder="(kein Name)"
        onChange={(e) => {
          model.name = e.target.value;
        }}
      />
      <ul>
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
        className="raised"
        onClick={() => model.properties.push(new Property(""))}
      >
        + Eigenschaft hinzufügen
      </button>
    </div>
  );
};

export default observer(ModelView);
