import { makeAutoObservable } from "mobx";
import { object, raw, serializable } from "serializr";
import { v4 as uuid } from "uuid";
import { GetConfigForGenerator } from "../generator/CodeGenerator";
import { GeneratorId } from "../generator/Generators";
import Model from "./model";
import Property from "./property";

export type GeneratorsType = {
  [key in GeneratorId]?: GetConfigForGenerator<key> | undefined;
};

export default class Schema {
  @serializable
  name = "Schema";

  @serializable(raw())
  generators: GeneratorsType = {};

  @serializable(object(Model))
  root = new Model("Entity", uuid());

  constructor() {
    makeAutoObservable(this);
    this.root.hasDatabaseCollection = false;
    const idProp = new Property("_id");
    idProp.key = true;
    idProp.unique = true;
    this.root.properties.push(idProp);
  }

  addModel() {
    this.root.children.push(new Model("", uuid(), this.root));
  }

  get models() {
    return this.root.children;
  }

  get allModels() {
    return [this.root, ...this.root.allChildren].flat();
  }
}
