import { makeAutoObservable } from "mobx";
import { object, serializable } from "serializr";
import { v4 as uuid } from "uuid";
import Model from "./model";

export default class Schema {
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
