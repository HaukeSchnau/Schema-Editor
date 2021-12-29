import React from "react";
import { observer } from "mobx-react";

type Action = {
  label: string;
  handler: () => void;
  disabled?: boolean;
};

interface HeaderProps {
  title: string;
  editable?: boolean;
  onChange?: (_val: string) => void;
  actions?: (Action | null)[];
}

const Header: React.FC<HeaderProps> = ({
  title,
  editable,
  onChange,
  actions = [],
}) => {
  return (
    <header>
      {editable ? (
        <input
          className="h1 grow"
          size={1}
          value={title}
          onChange={(e) => onChange && onChange(e.target.value)}
        />
      ) : (
        <h1>{title}</h1>
      )}
      <div className="button-row">
        {actions.map((action) =>
          !action || action.disabled ? null : (
            <button type="button" className="raised" onClick={action.handler}>
              {action.label}
            </button>
          )
        )}
      </div>
    </header>
  );
};

export default observer(Header);
