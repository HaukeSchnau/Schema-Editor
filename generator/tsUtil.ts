import Model from "../model/model";
import { DataType } from "../model/property";

export const propTypeMap = {
  Mixed: "unknown",
  int: "number",
  double: "number",
  string: "string",
  boolean: "boolean",
  Date: "Date",
};

type ImportOptions = {
  prefix?: string;
  useTypeImports?: boolean;
  baseDir?: string;
};

export const buildImport = (
  type?: DataType,
  options: ImportOptions = { baseDir: "." }
) => {
  const { prefix, useTypeImports, baseDir } = options;

  if (!type) return null;
  if (typeof type === "string") return null;
  const definedPrefix = prefix ?? "";

  return `import ${useTypeImports ? "type " : ""}${definedPrefix}${
    type.name
  } from "${baseDir || "."}/${definedPrefix}${type.name}";`;
};

export const buildImports = (model: Model, options?: ImportOptions) => {
  return [...model.uniquePropTypes, model.parent]
    .map((type) => buildImport(type, options))
    .filter((imp) => !!imp);
};
