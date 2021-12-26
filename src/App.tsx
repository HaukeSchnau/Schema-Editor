import React, { useState } from "react";
import { observer } from "mobx-react";
import { useDrop } from "react-dnd";
import { useStore } from "../model/rootStore";
import useAutoSave from "./hooks/useAutoSave";
import Schema from "../model/schema";
import SelectGeneratorsModal from "./components/SelectGeneratorsModal";
import generateInBrowser from "./generateInBrowser";
import ModelStage from "./components/ModelStage";
import Model from "../model/model";
import useRecentFiles from "./hooks/useRecentFiles";
import RecentFiles from "./components/RecentFiles";

const App = () => {
  const store = useStore();
  const { loadedSchema } = store;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const { saveToRecentFiles } = useRecentFiles();

  const [, drop] = useDrop(
    () => ({
      accept: "model",
      drop: (item: Model, monitor) => {
        if (monitor.didDrop()) return;
        loadedSchema?.root.addChild(item);
      },
    }),
    [loadedSchema]
  );

  const { loadDirectory, parentDirectory, reset } = useAutoSave<Schema | null>(
    "schema",
    Schema,
    (storedSchema) => {
      if (storedSchema) {
        storedSchema.root.link();
        store.loadedSchema = storedSchema;
      } else {
        store.loadedSchema = null;
      }
    },
    store.loadedSchema
  );

  const openFilePicker = async () => {
    const folderHandle = await window.showDirectoryPicker();
    saveToRecentFiles(folderHandle);
    loadDirectory(folderHandle);
  };

  return (
    <div ref={drop}>
      <div className="head-row">
        {loadedSchema ? (
          <input
            className="h1 grow"
            size={1}
            value={loadedSchema.name}
            onChange={(e) => {
              loadedSchema.name = e.target.value;
            }}
          />
        ) : (
          <h1>Schema-Editor</h1>
        )}
        <div className="button-row">
          <button type="button" className="raised" onClick={() => reset()}>
            Schließen
          </button>
          <button
            type="button"
            className="raised"
            onClick={() => openFilePicker()}
          >
            Projekt öffnen...
          </button>
          {loadedSchema && (
            <button
              type="button"
              className="raised"
              onClick={() => setModalOpen(true)}
            >
              Code generieren...
            </button>
          )}
        </div>
      </div>
      {loadedSchema ? (
        <>
          <div className="head-row mt-4">
            <h2>Alle Models</h2>
            <button
              type="button"
              className="raised"
              onClick={() => loadedSchema.addModel()}
            >
              Neues Model
            </button>
          </div>
          <ModelStage parent={loadedSchema.root} />
          <SelectGeneratorsModal
            generatorsMetaData={loadedSchema.generators}
            isOpen={isModalOpen}
            onRequestClose={() => setModalOpen(false)}
            onGenerate={(gens) =>
              generateInBrowser(loadedSchema, gens, parentDirectory.current!)
            }
          />
        </>
      ) : (
        <RecentFiles onOpen={(folder) => loadDirectory(folder)} />
      )}
    </div>
  );
};

export default observer(App);
