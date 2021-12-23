import { makeAutoObservable } from "mobx";
import Model from "./model";
import { v4 as uuid } from "uuid";
import { list, object, serializable } from "serializr";
import { PRIMITIVES } from "./property";

export default class Schema {
  @serializable(list(object(Model)))
  models: Model[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  link() {
    this.models.forEach((model) =>
      model.properties.forEach(
        (prop) =>
          (prop.type = PRIMITIVES.find((prim) => prop.type === prim)
            ? prop.type
            : this.models.find((model) => model.id === prop.type) ?? "string")
      )
    );
  }

  addModel() {
    this.models.push(new Model("", uuid()));
  }
}
