import { get, set } from "idb-keyval";
import { toJS } from "mobx";
import { useEffect } from "react";
import { useStore } from "../model/rootStore";

export type RecentFile = {
  file: FileSystemDirectoryHandle;
  lastOpened: Date;
};

export default function useRecentFiles() {
  const store = useStore();

  const loadRecentFiles = async () => {
    const newRecentFiles = await get("recentFiles");
    if (newRecentFiles) store.recentFiles = newRecentFiles;
  };

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const saveToRecentFiles = async (handle: FileSystemDirectoryHandle) => {
    let existingEntryIndex = -1;
    for (let i = 0; i < store.recentFiles.length; i++) {
      if (await handle.isSameEntry(store.recentFiles[i].file)) {
        existingEntryIndex = i;
        break;
      }
    }
    const recentFile = { file: handle, lastOpened: new Date() };
    store.recentFiles =
      existingEntryIndex !== -1
        ? [
            recentFile,
            ...store.recentFiles.slice(0, existingEntryIndex),
            ...store.recentFiles.slice(existingEntryIndex + 1),
          ]
        : [recentFile, ...store.recentFiles];

    set("recentFiles", toJS(store.recentFiles));
  };

  const removeFromRecentFiles = async (handle: FileSystemDirectoryHandle) => {
    let existingEntryIndex = -1;
    for (let i = 0; i < store.recentFiles.length; i++) {
      if (await handle.isSameEntry(store.recentFiles[i].file)) {
        existingEntryIndex = i;
        break;
      }
    }
    if (existingEntryIndex !== -1) {
      store.recentFiles.splice(existingEntryIndex, 1);
      set("recentFiles", toJS(store.recentFiles));
    }
  };

  return {
    recentFiles: store.recentFiles,
    saveToRecentFiles,
    removeFromRecentFiles,
    loadRecentFiles,
  };
}
