import React from "react";
import { observer } from "mobx-react";
import { useDrag } from "react-dnd";
import Model from "../model/model";

interface DraggableProps {
  item: Model;
  type: string;
}

const Draggable: React.FC<DraggableProps> = ({ children, item, type }) => {
  const [, drag] = useDrag(() => ({
    type,
    item,
  }));

  return <div ref={drag}>{children}</div>;
};

export default observer(Draggable);
