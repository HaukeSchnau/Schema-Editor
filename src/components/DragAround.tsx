import React from "react";
import { observer } from "mobx-react";
import { useDrag } from "react-dnd";
import Model from "../../model/model";

interface DragAroundProps {
  item: Model;
  type: string;
  x: number;
  y: number;
}

const DragAround: React.FC<DragAroundProps> = ({
  children,
  item,
  type,
  x,
  y,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  if (isDragging) return <div ref={drag} />;

  return (
    <div ref={drag} style={{ position: "absolute", left: x, top: y }}>
      {children}
    </div>
  );
};

export default observer(DragAround);
