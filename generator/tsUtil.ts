import Model from "../model/model";
import { DataType } from "../model/property";

export const propTypeMap = {
  Mixed: "any",
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
  rootImport?: string;
};

export const buildImport = (
  type?: DataType,
  options: ImportOptions = { baseDir: "." }
) => {
  const { prefix, useTypeImports, baseDir, rootImport } = options;

  if (!type) return null;
  if (typeof type === "string") return null;

  if (!type.parent && rootImport) return rootImport;

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
