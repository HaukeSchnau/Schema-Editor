import { useRef } from "react";
import { deserialize, serialize } from "serializr";
import verifyPermission from "../verifyPermission";
import useInterval from "./useInterval";

type ClassConstructor<T> = {
  new (..._args: any[]): T;
};

export default function useAutoSave<T>(
  cls: ClassConstructor<T>,
  onLoad: (_obj: T | null) => void,
  createDefaultObject: (_parent: FileSystemDirectoryHandle) => T,
  item?: T,
  beforeSerialize?: (_item: T) => void,
  interval = 1000
) {
  const parentDirectory = useRef<FileSystemDirectoryHandle | null>(null);
  const fileHandle = useRef<FileSystemFileHandle | null>(null);
  const isDirty = useRef(false);

  const load = (json: string | null) => {
    onLoad(json ? deserialize<T>(cls, JSON.parse(json)) : null);
  };

  const loadDirectory = async (
    folder: FileSystemDirectoryHandle,
    fileName = "schema.json"
  ) => {
    if (!(await verifyPermission(folder))) return;
    parentDirectory.current = folder;

    const file = await folder.getFileHandle(fileName, { create: true });
    if (await verifyPermission(file)) {
      fileHandle.current = file;
      const f = await file.getFile();
      const text = await f.text();
      if (text) load(text);
      else onLoad(createDefaultObject(folder));
    }
  };

  const saveFile = async (handle: FileSystemFileHandle | null) => {
    if (!handle || !item) return;
    const writable = await handle.createWritable();
    if (beforeSerialize) beforeSerialize(item);
    await writable?.write(JSON.stringify(serialize<T>(cls, item), null, 2));
    await writable?.close();
    isDirty.current = false;
  };

  const reset = async () => {
    fileHandle.current = null;
    parentDirectory.current = null;
    load(null);
  };

  useInterval(() => saveFile(fileHandle.current), interval, [item]);

  const notifyDirty = () => {
    isDirty.current = true;
  };

  return {
    loadDirectory,
    reset,
    parentDirectory,
    notifyDirty,
  };
}
