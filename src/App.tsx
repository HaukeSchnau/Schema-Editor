import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { get, set } from "idb-keyval";
import { useDrop } from "react-dnd";
import { useStore } from "../model/rootStore";
import useAutoSave from "./hooks/useAutoSave";
import Schema from "../model/schema";
import SelectGeneratorsModal from "./components/DialogModal";
import generateInBrowser from "./generateInBrowser";
import ModelStage from "./components/ModelStage";
import Model from "../model/model";

const filePickerOptions = {
  types: [
    {
      description: "Schema Files",
      accept: {
        "application/json": [".json"],
      },
    },
  ],
};

const App = () => {
  const store = useStore();
  const { loadedSchema } = store;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

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

  const { loadFile, saveFile, reset, file } = useAutoSave<Schema | null>(
    "schema",
    Schema,
    (storedSchema) => {
      if (storedSchema) {
        storedSchema.root.link();
        store.loadedSchema = storedSchema;
      } else {
        store.loadedSchema = new Schema();
      }
    },
    store.loadedSchema
  );

  const [recentFiles, setRecentFiles] = useState<FileSystemFileHandle[]>([]);

  useEffect(() => {
    (async () => {
      const newRecentFiles = await get("recentFiles");
      if (newRecentFiles) setRecentFiles(newRecentFiles);
    })();
  }, []);

  const saveToRecentFiles = async (handle: FileSystemFileHandle) => {
    let existingEntryIndex = -1;
    for (let i = 0; i < recentFiles.length; i++) {
      if (await handle.isSameEntry(recentFiles[i])) {
        existingEntryIndex = i;
        break;
      }
    }
    const newRecentFiles =
      existingEntryIndex !== -1
        ? [
            handle,
            ...recentFiles.slice(0, existingEntryIndex),
            ...recentFiles.slice(existingEntryIndex + 1),
          ]
        : [handle, ...recentFiles];

    set("recentFiles", newRecentFiles);
    setRecentFiles(newRecentFiles);
  };

  const openFilePicker = async () => {
    const [fileHandle] = await window.showOpenFilePicker(filePickerOptions);
    saveToRecentFiles(fileHandle);
    loadFile(fileHandle);
  };

  const openSaveDialog = async () => {
    const handle = await window.showSaveFilePicker({
      ...filePickerOptions,
      suggestedName: "schema.json",
    });
    saveToRecentFiles(handle);
    saveFile(handle);
  };

  return (
    <div ref={drop}>
      <div className="head-row">
        <h1>{file?.name || "Schema-Editor"}</h1>
        <div className="button-row">
          <button type="button" className="raised" onClick={() => reset()}>
            Neues Schema
          </button>
          <button
            type="button"
            className="raised"
            onClick={() => openFilePicker()}
          >
            Datei Laden...
          </button>
          {loadedSchema && (
            <>
              <button
                type="button"
                className="raised"
                onClick={() => openSaveDialog()}
              >
                Speichern unter...
              </button>
              <button
                type="button"
                className="raised"
                onClick={() => setModalOpen(true)}
              >
                Code generieren...
              </button>
            </>
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
            isOpen={isModalOpen}
            onRequestClose={() => setModalOpen(false)}
            onGenerate={(gens) => generateInBrowser(loadedSchema, gens)}
          />
        </>
      ) : (
        <>
          <h3 className="mt-4">Letzte Dateien</h3>
          <ul>
            {recentFiles.map((recentFile) => (
              <button
                key={recentFile.name + recentFile.kind}
                className="link"
                type="button"
                onClick={() => {
                  loadFile(recentFile);
                  saveToRecentFiles(recentFile);
                }}
              >
                {recentFile.name}
              </button>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default observer(App);
