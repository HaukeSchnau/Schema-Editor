import { makeAutoObservable } from "mobx";
import { custom, serializable } from "serializr";
import { v4 as uuid } from "uuid";
import Model from "./model";

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
  optional = false;

  @serializable
  array = false;

  @serializable
  key = false;

  @serializable
  unique = false;

  @serializable
  lazy = false;

  @serializable
  defaultValue: string | null = null;

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
