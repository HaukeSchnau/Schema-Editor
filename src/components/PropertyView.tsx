import React, { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { observer } from "mobx-react";
import Property, { PRIMITIVES } from "../../model/property";
import { useStore } from "../../model/rootStore";
import useClickAway from "../hooks/useClickAway";

interface PropertyViewProps {
  prop: Property;
  addProperty: () => void;
  onDelete: () => void;
}

const PropertyView: React.FC<PropertyViewProps> = ({
  prop,
  onDelete,
  addProperty,
}) => {
  const { loadedSchema } = useStore();
  const [typeEditorOpen, setTypeEditorOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  useClickAway([overlayRef, buttonRef], () => setTypeEditorOpen(false));

  if (!loadedSchema)
    throw new Error("Schema should not be null when rendering PropertyView");
  const { allModels } = loadedSchema;

  const toggleTypeEditor = () => setTypeEditorOpen(!typeEditorOpen);

  const renderPropType = () => {
    const typeName = typeof prop.type === "string" ? prop.type : prop.type.name;
    const formatted = `${typeName}${prop.array ? "[]" : ""}${
      prop.optional ? "?" : ""
    }`;
    if (prop.lazy) return `Lazy<${formatted}>`;
    if (prop.key) return <u>{formatted}</u>;
    return formatted;
  };

  const typeOptions = [...PRIMITIVES, ...allModels];

  const onChangeDataType = (index: number) => {
    prop.type = typeOptions[index];
  };

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    prop.name = e.target.value;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      addProperty();
    }
  };

  return (
    <li className="prop input-row">
      <input
        value={prop.name}
        placeholder="(kein Name)"
        onChange={onChangeName}
        onKeyDown={onKeyDown}
        size={1}
        autoFocus
      />
      <button
        type="button"
        className="type"
        onClick={toggleTypeEditor}
        ref={buttonRef}
      >
        <code>{renderPropType()}</code>
      </button>
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
                checked={prop.lazy}
                onChange={(e) => {
                  prop.lazy = e.target.checked;
                }}
              />
              Lazy
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
            <label>
              <input
                type="checkbox"
                checked={prop.unique}
                onChange={(e) => {
                  prop.unique = e.target.checked;
                }}
              />
              Einzigartig
            </label>
            <select
              onChange={(e) => onChangeDataType(parseInt(e.target.value, 10))}
            >
              {typeOptions.map((option, i) => (
                <option
                  value={i}
                  selected={option === prop.type}
                  key={typeof option === "string" ? option : option.id}
                >
                  {typeof option === "string" ? option : option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <button type="button" className="icon" onClick={onDelete}>
        ✕
      </button>
    </li>
  );
};

export default observer(PropertyView);
