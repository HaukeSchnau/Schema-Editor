import Model from "../model/model";
import Property, { DataType } from "../model/property";
import CodeGenerator from "./CodeGenerator";

const propTypeMap = {
  Mixed: "unknown",
  int: "number",
  double: "number",
  string: "string",
  boolean: "boolean",
  Date: "Date",
};

export default class BasicTypescriptGenerator extends CodeGenerator {
  static generatorName = "Basic TypeScript";

  static generatorId = "tsbasic";

  static defaultBaseDir = "ts/base";

  buildImport(type?: DataType) {
    if (!type) return null;
    if (typeof type === "string") return null;

    return `import type Basic${type.name} from "./Basic${type.name}";`;
  }

  buildImports(model: Model) {
    return [...model.uniquePropTypes, model.parent]
      .map((type) => this.buildImport(type))
      .filter((imp) => !!imp);
  }

  buildProp(prop: Property) {
    const propTypeStr =
      typeof prop.type === "string"
        ? propTypeMap[prop.type]
        : `Basic${prop.type.name}`;

    return `${prop.name}${prop.optional ? "?" : ""}: ${propTypeStr}${
      prop.array ? "[]" : ""
    };`;
  }

  generateModel(model: Model) {
    const imports = this.buildImports(model).join("\n");
    const isRoot = !model.parent;

    const { parent } = model;

    return `${
      isRoot ? `import { ObjectId } from "mongodb";\n\n` : ""
    }${imports}${imports.length ? "\n\n" : ""}// Generated file. DO NOT EDIT!
export default interface Basic${model.name}${
      parent ? ` extends Basic${parent.name}` : ""
    } {
  ${isRoot ? `_id: ObjectId;\n  ` : ""}${model.properties
      .map(this.buildProp)
      .join("\n  ")}
}
`;
  }

  getFileName(model: Model) {
    return `Basic${model.name}.ts`;
  }
}
