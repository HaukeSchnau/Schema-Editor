import React from "react";
import { observer } from "mobx-react";
import { deserialize, serialize } from "serializr";
import { useStore } from "../model/rootStore";
import ModelView from "./components/ModelView";
import useAutoSave from "../hooks/useAutoSave";
import Schema from "../model/schema";

const App = () => {
  const store = useStore();
  const { loadedSchema } = store;

  useAutoSave<Schema>(
    "schema",
    Schema,
    (storedSchema) => {
      if (storedSchema) {
        storedSchema.link();
        store.loadedSchema = storedSchema;
      }
    },
    store.loadedSchema
  );

  const openFilePicker = () => {
    const inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.accept = ".json";
    inputEl.click();
    inputEl.addEventListener("change", () => {
      const files = inputEl.files ?? [];
      const f = files[0];
      f.text().then((text) => {
        const schema = deserialize(Schema, JSON.parse(text));
        schema.link();
        store.loadedSchema = schema;
      });
    });
  };

  const downloadSchema = () => {
    const json = JSON.stringify(serialize(loadedSchema));
    const anchorEl = document.createElement("a");
    anchorEl.setAttribute(
      "href",
      `data:application/json;charset=utf-8,${encodeURIComponent(json)}`
    );
    anchorEl.setAttribute("download", "schema.json");
    anchorEl.click();
  };

  return (
    <>
      <div className="head-row">
        <h1>Schema-Editor</h1>
        <div>
          <button
            type="button"
            className="raised"
            onClick={() => openFilePicker()}
          >
            Laden...
          </button>
          <button
            type="button"
            className="raised"
            onClick={() => downloadSchema()}
          >
            Speichern
          </button>
        </div>
      </div>
      <div className="head-row">
        <h2>Alle Models</h2>
        <button
          type="button"
          className="raised"
          onClick={() => loadedSchema.addModel()}
        >
          Neues Model
        </button>
      </div>
      <div className="grid">
        {loadedSchema.models.map((model) => (
          <ModelView model={model} key={model.id} />
        ))}
      </div>
    </>
  );
};

export default observer(App);
