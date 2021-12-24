import { makeAutoObservable } from "mobx";
import { v4 as uuid } from "uuid";
import { list, object, serializable } from "serializr";
import Model from "./model";
import { PRIMITIVES } from "./property";

export default class Schema {
  @serializable(list(object(Model)))
  models: Model[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  link() {
    this.models.forEach((model) =>
      model.properties.forEach((prop) => {
        const linkedType = PRIMITIVES.find((prim) => prop.type === prim)
          ? prop.type
          : this.models.find(
              (modelCandidate) => modelCandidate.id === prop.type
            );
        if (linkedType) {
          prop.type = linkedType;
        }
      })
    );
  }

  addModel() {
    this.models.push(new Model("", uuid()));
  }
}
