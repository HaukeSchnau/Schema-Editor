import { useRef, useState } from "react";
import { deserialize, serialize } from "serializr";
import useInterval from "./useInterval";

type ClassConstructor<T> = {
  new (..._args: any[]): T;
};

async function verifyPermission(fileHandle: FileSystemFileHandle) {
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission({ mode: "readwrite" })) === "granted") {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if (
    (await fileHandle.requestPermission({ mode: "readwrite" })) === "granted"
  ) {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}

export default function useAutoSave<T>(
  name: string,
  cls: ClassConstructor<T>,
  onLoad: (_obj: T | null) => void,
  item?: T,
  interval = 1000
) {
  const fileHandle = useRef<FileSystemFileHandle | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const load = (json: string | null) => {
    onLoad(json ? deserialize(cls, JSON.parse(json)) : null);
  };

  const loadFile = async (handle: FileSystemFileHandle) => {
    if (await verifyPermission(handle)) {
      fileHandle.current = handle;
      const f = await handle.getFile();
      setFile(f);
      const text = await f.text();
      load(text);
    }
  };

  const saveFile = async (handle: FileSystemFileHandle | null) => {
    if (!handle) return;
    const writable = await handle.createWritable();
    await writable?.write(JSON.stringify(serialize(item)));
    await writable?.close();
    const f = await handle.getFile();
    setFile(f);
  };

  const reset = async () => {
    fileHandle.current = null;
    setFile(null);
    load(null);
  };

  useInterval(() => saveFile(fileHandle.current), interval, [item]);

  return { loadFile, saveFile, reset, file };
}
