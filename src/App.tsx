import React from "react";
import { observer } from "mobx-react";
import { useStore } from "../model/rootStore";
import ModelView from "./components/ModelView";
import useAutoSave from "./hooks/useAutoSave";
import Schema from "../model/schema";

const App = () => {
  const store = useStore();
  const { loadedSchema } = store;

  const loadFile = useAutoSave<Schema>(
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

  const openFilePicker = async () => {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Schema Files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
    });
    loadFile(fileHandle);
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
