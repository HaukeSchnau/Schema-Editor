import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { get, set } from "idb-keyval";
import { useDrop } from "react-dnd";
import { useStore } from "../model/rootStore";
import useAutoSave from "./hooks/useAutoSave";
import Schema from "../model/schema";
import SelectGeneratorsModal from "./components/SelectGeneratorsModal";
import generateInBrowser from "./generateInBrowser";
import ModelStage from "./components/ModelStage";
import Model from "../model/model";

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

  const { loadDirectory, parentDirectory } = useAutoSave<Schema | null>(
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

  const [recentFiles, setRecentFiles] = useState<FileSystemDirectoryHandle[]>(
    []
  );

  useEffect(() => {
    (async () => {
      const newRecentFiles = await get("recentFiles");
      if (newRecentFiles) setRecentFiles(newRecentFiles);
    })();
  }, []);

  const saveToRecentFiles = async (handle: FileSystemDirectoryHandle) => {
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
          <button
            type="button"
            className="raised"
            onClick={() => openFilePicker()}
          >
            Ordner öffnen
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
            isOpen={isModalOpen}
            onRequestClose={() => setModalOpen(false)}
            onGenerate={(gens) =>
              generateInBrowser(loadedSchema, gens, parentDirectory.current!)
            }
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
                  loadDirectory(recentFile);
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
