import { makeAutoObservable } from "mobx";
import { custom, object, reference, serializable } from "serializr";
import Model from "./model";
import { v4 as uuid } from "uuid";

export const PRIMITIVES = <const>[
  "string",
  "boolean",
  "double",
  "int",
  "Date",
  "Mixed",
];
export type DataType = typeof PRIMITIVES[number] | Model;

export default class Property {
  @serializable
  id: string;

  @serializable
  name: string;

  @serializable
  optional?: boolean;

  @serializable
  array?: boolean;

  @serializable
  key?: boolean;

  @serializable(
    custom(
      (type) => (typeof type === "string" ? type : type.id),
      (json, context, oldValue, callback) => {
        callback(null, json);
      }
    )
  )
  type: DataType = "string";

  constructor(name: string) {
    this.id = uuid();
    this.name = name;
    makeAutoObservable(this);
  }
}
