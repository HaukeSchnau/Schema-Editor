import { useRef, useState } from "react";
import { deserialize, serialize } from "serializr";
import verifyPermission from "../verifyPermission";
import useInterval from "./useInterval";

type ClassConstructor<T> = {
  new (..._args: any[]): T;
};

export default function useAutoSave<T>(
  name: string,
  cls: ClassConstructor<T>,
  onLoad: (_obj: T | null) => void,
  item?: T,
  interval = 1000
) {
  const fileHandle = useRef<FileSystemFileHandle | null>(null);

  const load = (json: string | null) => {
    onLoad(json ? deserialize<T>(cls, JSON.parse(json)) : null);
  };

  const loadFile = async (handle: FileSystemFileHandle) => {
    if (await verifyPermission(handle)) {
      fileHandle.current = handle;
      const f = await handle.getFile();
      const text = await f.text();
      load(text);
    }
  };

  const saveFile = async (handle: FileSystemFileHandle | null) => {
    if (!handle || !item) return;
    const writable = await handle.createWritable();
    await writable?.write(JSON.stringify(serialize<T>(cls, item), null, 2));
    await writable?.close();
  };

  const reset = async () => {
    fileHandle.current = null;
    load(null);
  };

  useInterval(() => saveFile(fileHandle.current), interval, [item]);

  return { loadFile, saveFile, reset };
}
