import React from "react";
import { observer } from "mobx-react";
import { useDrop } from "react-dnd";
import Model from "../model/model";
import ModelView from "./ModelView";
import DragAround from "./DragAround";

interface MainModelStageProps {
  parent: Model;
}

const MainModelStage: React.FC<MainModelStageProps> = ({ parent }) => {
  const [, drop] = useDrop(() => ({
    accept: "model",
    drop: (item: Model, monitor) => {
      if (monitor.didDrop()) return;
      item.deleteFromTree();
      parent.addChild(item);
      item.x += monitor.getDifferenceFromInitialOffset()?.x ?? 0;
      item.y += monitor.getDifferenceFromInitialOffset()?.y ?? 0;
      item.x = Math.max(item.x, 0);
      item.y = Math.max(item.y, 0);
    },
  }));

  const { allChildren } = parent;

  const width = allChildren.length
    ? allChildren.reduce((prev, current) =>
        current.x > prev.x ? current : prev
      ).x + 1000
    : 0;
  const height = allChildren.length
    ? allChildren.reduce((prev, current) =>
        current.y > prev.y ? current : prev
      ).y + 1000
    : 0;

  return (
    <div className="model-stage-wrapper">
      <div className="model-stage mt-4" ref={drop} style={{ width, height }}>
        {parent.children.map((model) => (
          <DragAround
            type="model"
            key={model.id}
            item={model}
            x={model.x}
            y={model.y}
          >
            <ModelView model={model} />
          </DragAround>
        ))}
      </div>
    </div>
  );
};

export default observer(MainModelStage);
