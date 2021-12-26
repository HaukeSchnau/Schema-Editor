import React, { Ref } from "react";
import { observer } from "mobx-react";
import cx from "classnames";

interface CardProps {
  ref?: Ref<HTMLDivElement>;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, ref, onClick, className }) => {
  if (onClick)
    return (
      <button type="button" className={cx("card", className)} onClick={onClick}>
        {children}
      </button>
    );

  return (
    <div className="card" ref={ref}>
      {children}
    </div>
  );
};

export default observer(Card);
