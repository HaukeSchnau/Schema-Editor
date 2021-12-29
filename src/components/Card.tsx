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
      <div
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === "Enter" && onClick()}
        className={cx("card", "button", className)}
        onClick={onClick}
      >
        {children}
      </div>
    );

  return (
    <div className="card" ref={ref}>
      {children}
    </div>
  );
});

export default observer(Card);
