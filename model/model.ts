import { makeAutoObservable } from "mobx";
import { identifier, list, object, serializable } from "serializr";
import Property from "./property";

export default class Model {
  @serializable
  name: string;

  @serializable(identifier())
  id: string;

  @serializable
  hasDatabaseCollection = true;

  @serializable(list(object(Property)))
  properties: Property[] = [];

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
    makeAutoObservable(this);
  }
}
