import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { get, set } from "idb-keyval";
import { useStore } from "../model/rootStore";
import ModelView from "./components/ModelView";
import useAutoSave from "./hooks/useAutoSave";
import Schema from "../model/schema";
import Generators from "../generator/Generators";
import SelectGeneratorsModal from "./components/SelectGeneratorsModal";
import CodeGenerator from "../generator/CodeGenerator";

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

  const { loadFile, saveFile, reset, file } = useAutoSave<Schema | null>(
    "schema",
    Schema,
    (storedSchema) => {
      if (storedSchema) {
        storedSchema.link();
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

  const generateCode = async (gens: string[]) => {
    const rootDir = await window.showDirectoryPicker();
    if (!loadedSchema) throw new Error("loadedSchema should not be null");
    await Promise.all(
      gens.map(async (generatorId) => {
        const Generator = Generators.get(generatorId);
        if (!Generator) return;
        const generator = new Generator();
        const generatedFiles = generator.generate(loadedSchema);
        const baseDir = await rootDir.getDirectoryHandle(generator.baseDir, {
          create: true,
        });
        await Promise.all(
          generatedFiles.map(async (generatedFile) => {
            const outFile = await baseDir.getFileHandle(generatedFile.name, {
              create: true,
            });
            const writable = await outFile.createWritable();
            await writable.write(generatedFile.contents);
            await writable.close();
          })
        );
      })
    );
  };

  return (
    <>
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
          <div className="grid">
            {loadedSchema.models.map((model) => (
              <ModelView model={model} key={model.id} />
            ))}
          </div>
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
      <SelectGeneratorsModal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        onGenerate={(gens) => generateCode(gens)}
      />
    </>
  );
};

export default observer(App);
