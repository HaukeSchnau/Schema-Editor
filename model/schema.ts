import { makeAutoObservable } from "mobx";
import { map, object, primitive, serializable } from "serializr";
import { v4 as uuid } from "uuid";
import Generators from "../generator/Generators";
import Model from "./model";

export default class Schema {
  @serializable
  name = "Schema";

  @serializable(
    map(primitive(), {
      afterDeserialize: (callback, err, newValue) => {
        for (const [genId, Generator] of Generators.entries()) {
          if (!newValue.has(genId))
            newValue.set(genId, Generator.defaultBaseDir);
        }
        callback(err, newValue);
      },
    })
  )
  outDirs = new Map<string, string>();

  @serializable(object(Model))
  root = new Model("Entity", uuid());

  constructor() {
    makeAutoObservable(this);
  }

  addModel() {
    this.root.children.push(new Model("", uuid(), this.root));
  }

  get models() {
    return this.root.children;
  }

  get allModels() {
    return [
      this.root,
      ...this.root.children,
      ...this.root.children.map((child) => child.allChildren),
    ].flat();
  }
}
