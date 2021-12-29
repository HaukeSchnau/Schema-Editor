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
import Footer from "./components/Footer";
import Header from "./components/Header";

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
    Schema,
    (storedSchema) => {
      if (storedSchema) {
        storedSchema.root.link();
        store.loadedSchema = storedSchema;
      } else {
        store.loadedSchema = null;
      }
    },
    (parent: FileSystemDirectoryHandle) => {
      const schema = new Schema();
      schema.name = parent.name;
      return schema;
    },
    store.loadedSchema
  );

  const openFilePicker = async () => {
    const folderHandle = await window.showDirectoryPicker();
    saveToRecentFiles(folderHandle);
    loadDirectory(folderHandle);
  };

  return (
    <div ref={drop} className="app">
      <Header
        title={loadedSchema ? loadedSchema.name : "Schema-Editor"}
        editable={!!loadedSchema}
        onChange={(newVal) => {
          if (loadedSchema) loadedSchema.name = newVal;
        }}
        actions={[
          {
            label: "Schließen",
            handler: reset,
            disabled: !loadedSchema,
          },
          {
            label: "Projekt öffnen...",
            handler: openFilePicker,
          },
          {
            label: "Code generieren...",
            handler: () => setModalOpen(true),
            disabled: !loadedSchema,
          },
        ]}
      />
      <main>
        {loadedSchema ? (
          <>
            <header className="mt-4">
              <h2>Alle Models</h2>
              <button
                type="button"
                className="raised"
                onClick={() => loadedSchema.addModel()}
              >
                Neues Model
              </button>
            </header>
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
      </main>
      <Footer />
    </div>
  );
};

export default observer(App);
