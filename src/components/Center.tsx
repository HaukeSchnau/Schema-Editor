import React from "react";
import { observer } from "mobx-react";

const Center: React.FC = ({ children }) => {
  return <div className="centered">{children}</div>;
};

export default observer(Center);
