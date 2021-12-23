import React, { useRef, useState } from "react";
import { observer } from "mobx-react";
import Property, { PRIMITIVES } from "../../model/property";
import { useStore } from "../../model/rootStore";
import useClickAway from "../hooks/useClickAway";

interface PropertyViewProps {
  prop: Property;
  onDelete: () => void;
}

const PropertyView: React.FC<PropertyViewProps> = ({ prop, onDelete }) => {
  const { loadedSchema } = useStore();
  const { models } = loadedSchema;
  const [typeEditorOpen, setTypeEditorOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickAway([overlayRef, buttonRef], () => setTypeEditorOpen(false));

  const toggleTypeEditor = () => setTypeEditorOpen(!typeEditorOpen);

  const renderPropType = () => {
    const typeName = typeof prop.type === "string" ? prop.type : prop.type.name;
    const formatted = `${typeName}${prop.array ? "[]" : ""}${
      prop.optional ? "?" : ""
    }`;
    if (prop.key) return <u>{formatted}</u>;
    return formatted;
  };

  const typeOptions = [...PRIMITIVES, ...models];

  const onChangeDataType = (index: number) => {
    prop.type = typeOptions[index];
  };

  const onChangeName = (e: any) => {
    prop.name = e.target.value;
  };

  return (
    <li className="prop">
      {typeEditorOpen && (
        <div className="overlay-wrapper">
          <div className="overlay" ref={overlayRef}>
            Datentyp von {prop.name}:
            <label>
              <input
                type="checkbox"
                checked={prop.array}
                onChange={(e) => {
                  prop.array = e.target.checked;
                }}
              />
              Array
            </label>
            <label>
              <input
                type="checkbox"
                checked={prop.optional}
                onChange={(e) => {
                  prop.optional = e.target.checked;
                }}
              />
              Optional
            </label>
            <label>
              <input
                type="checkbox"
                checked={prop.key}
                onChange={(e) => {
                  prop.key = e.target.checked;
                }}
              />
              Schlüssel
            </label>
            <select
              onChange={(e) => onChangeDataType(parseInt(e.target.value, 10))}
            >
              {typeOptions.map((option, i) => (
                <option
                  value={i}
                  key={typeof option === "string" ? option : option.id}
                >
                  {typeof option === "string" ? option : option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div>
        <input
          style={{ width: "40%" }}
          value={prop.name}
          placeholder="(kein Name)"
          onChange={onChangeName}
        />
        <button type="button" onClick={toggleTypeEditor} ref={buttonRef}>
          <code>{renderPropType()}</code>
        </button>
      </div>

      <button type="button" onClick={onDelete}>
        ✕
      </button>
    </li>
  );
};

export default observer(PropertyView);
