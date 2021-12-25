import { makeAutoObservable } from "mobx";
import { object, serializable } from "serializr";
import { v4 as uuid } from "uuid";
import Model from "./model";

export default class Schema {
  @serializable(object(Model))
  root = new Model("Root", uuid());

  constructor() {
    makeAutoObservable(this);
  }

  addModel() {
    this.root.children.push(new Model("", uuid(), this.root));
  }

  get models() {
    return this.root.children;
  }
}
