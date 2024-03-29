import { LiteralUnion, BuiltInParserName } from "prettier";
import Model from "../../model/model";
import Property from "../../model/property";
import CodeGenerator from "../CodeGenerator";
import { propTypeMap, buildImports } from "../util/tsUtil";

export default class BasicTypescriptGenerator extends CodeGenerator {
  static readonly language: LiteralUnion<BuiltInParserName, string> =
    "typescript";

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
    const imports = buildImports(model, {
      prefix: "Basic",
      useTypeImports: true,
    }).join("\n");
    const isRoot = !model.parent;

    const { parent } = model;

    const props = model.properties.filter(
      (prop) => !isRoot || prop.name !== "_id"
    );

    return `${
      isRoot ? `import { ObjectId } from "mongodb";\n\n` : ""
    }${imports}${imports.length ? "\n\n" : ""}// Generated file. DO NOT EDIT!
export default interface Basic${model.name}${
      parent ? ` extends Basic${parent.name}` : ""
    } {
  ${isRoot ? `_id: ObjectId;\n  ` : ""}${props.map(this.buildProp).join("\n  ")}
}
`;
  }

  getFileName(model: Model) {
    return `Basic${model.name}.ts`;
  }
}
