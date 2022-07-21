import Model from "../model/model";
import { DataType } from "../model/property";
import { toSnakeCase } from "./stringUtil";

export const propTypeMap = {
  Mixed: "dynamic",
  int: "int",
  double: "double",
  string: "String",
  boolean: "bool",
  Date: "DateTime",
};

export function buildImport(type: DataType) {
  if (typeof type === "string" || !type.parent) return null;

  return `import '../model/${toSnakeCase(type.name)}.dart';`;
}

export function buildImports(model: Model) {
  return model.uniquePropTypes
    .map((type) => buildImport(type))
    .filter((imp) => !!imp);
}
