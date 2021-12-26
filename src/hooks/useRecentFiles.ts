import { get, set } from "idb-keyval";
import { useEffect } from "react";
import { useStore } from "../../model/rootStore";

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
      if (await handle.isSameEntry(store.recentFiles[i])) {
        existingEntryIndex = i;
        break;
      }
    }
    store.recentFiles =
      existingEntryIndex !== -1
        ? [
            handle,
            ...store.recentFiles.slice(0, existingEntryIndex),
            ...store.recentFiles.slice(existingEntryIndex + 1),
          ]
        : [handle, ...store.recentFiles];

    set("recentFiles", store.recentFiles.slice());
  };

  return { recentFiles: store.recentFiles, saveToRecentFiles, loadRecentFiles };
}
