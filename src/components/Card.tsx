import React from "react";
import { observer } from "mobx-react";
import cx from "classnames";

interface CardProps {
  onClick?: () => void;
  className?: string;
  // eslint-disable-next-line react/no-unused-prop-types
  ref?: React.Ref<HTMLDivElement>;
}

const Card: React.ComponentType<CardProps> = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ children, onClick, className }, ref) => {
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
});

export default observer(Card);
