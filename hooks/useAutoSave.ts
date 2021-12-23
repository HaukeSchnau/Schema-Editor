import { plainToClass } from "class-transformer";
import { useEffect, useRef } from "react";
import { deserialize, serialize } from "serializr";
import useInterval from "./useInterval";

type ClassConstructor<T> = {
  new (...args: any[]): T;
};

export default function useAutoSave<T>(
  name: string,
  cls: ClassConstructor<T>,
  onLoad: (obj: T | null) => void,
  item?: T,
  interval = 1000
) {
  useEffect(() => {
    const json = localStorage.getItem(name);
    onLoad(json ? deserialize(cls, JSON.parse(json)) : null);
  }, []);

  useInterval(
    () => {
      localStorage.setItem(name, JSON.stringify(serialize(item)));
    },
    interval,
    [item]
  );
}
