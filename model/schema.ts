import { makeAutoObservable } from "mobx";
import { map, object, serializable } from "serializr";
import { v4 as uuid } from "uuid";
import Generators from "../generator/Generators";
import Model from "./model";
import GeneratorMetaData from "./generatorMetaData";

export default class Schema {
  @serializable
  name = "Schema";

  @serializable(
    map(object(GeneratorMetaData), {
      afterDeserialize: (
        callback,
        err,
        newValue: Map<string, GeneratorMetaData>
      ) => {
        for (const [genId, Generator] of Generators.entries()) {
          if (!newValue.has(genId))
            newValue.set(
              genId,
              new GeneratorMetaData(Generator.defaultBaseDir, false)
            );
        }
        callback(err, newValue);
      },
    })
  )
  generators = new Map<string, GeneratorMetaData>();

  @serializable(object(Model))
  root = new Model("Entity", uuid());

  constructor() {
    makeAutoObservable(this);
    this.root.hasDatabaseCollection = false;
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
