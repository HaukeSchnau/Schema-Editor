import Model from "../model/model";
import Property, { DataType } from "../model/property";
import CodeGenerator from "./CodeGenerator";
import p from "path";

const propTypeMap = {
  Mixed: "unknown",
  int: "number",
  double: "number",
  string: "string",
  boolean: "boolean",
  Date: "Date",
};

export default class BasicTypescriptGenerator extends CodeGenerator {
  constructor(outDir: string) {
    super(p.join(outDir, "base"));
  }

  buildImport(type: DataType) {
    if (typeof type === "string") return null;

    return `import type Basic${type.name} from "./Basic${type.name}";`;
  }

  buildImports(model: Model) {
    const propTypes = [...new Set(model.properties.map((prop) => prop.type))];
    return propTypes
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

    return `${imports}${
      imports.length ? "\n\n" : ""
    }export default interface Basic${model.name} {
  ${model.properties.map(this.buildProp).join("\n  ")}
}
`;
  }

  getFileName(model: Model) {
    return `Basic${model.name}.ts`;
  }
}
