import { useEffect, useRef } from "react";
import { deserialize, serialize } from "serializr";
import { get, set } from "idb-keyval";
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
  const fileHandle = useRef<FileSystemFileHandle | null>();

  const load = (json: string | null | undefined) => {
    onLoad(json ? deserialize(cls, JSON.parse(json)) : null);
  };

  const loadFile = async (handle: FileSystemFileHandle) => {
    fileHandle.current = handle;
    await set("file", handle);
    const f = await handle.getFile();
    const text = await f.text();
    load(text);
  };

  useEffect(() => {
    (async () => {
      const handle = await get("file");
      if (handle) loadFile(handle);
    })();
  }, []);

  useInterval(
    async () => {
      const writable = await fileHandle.current?.createWritable();
      await writable?.write(JSON.stringify(serialize(item)));
      await writable?.close();
    },
    interval,
    [item]
  );

  return loadFile;
}
