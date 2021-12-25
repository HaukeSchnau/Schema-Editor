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
  if (typeof type === "string") return null;

  return `import '../model/${toSnakeCase(type.name)}.dart';`;
}

export function buildImports(model: Model) {
  model.properties.map((prop) => prop.type).map((type) => buildImport(type));
  const propTypes = [...new Set(model.properties.map((prop) => prop.type))];
  return propTypes.map((type) => buildImport(type)).filter((imp) => !!imp);
}
