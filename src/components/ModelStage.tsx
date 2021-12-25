import React from "react";
import { observer } from "mobx-react";
import Model from "../../model/model";
import ModelView from "./ModelView";
import Draggable from "./Draggable";

interface ModelStageProps {
  parent: Model;
}

const ModelStage: React.FC<ModelStageProps> = ({ parent }) => {
  return (
    <div className="grid mt-4">
      {parent.children.map((model) => (
        <Draggable type="model" key={model.id} item={model}>
          <ModelView model={model} />
        </Draggable>
      ))}
    </div>
  );
};

export default observer(ModelStage);
