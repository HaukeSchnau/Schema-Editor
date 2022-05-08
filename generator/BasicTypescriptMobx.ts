import Model from "../model/model";
import Property from "../model/property";
import CodeGenerator from "./CodeGenerator";
import CustomTypescriptMobx from "./CustomTypescriptMobx";
import { buildImports, propTypeMap } from "./tsUtil";
import p from "path";

export default class BasicTypescriptMobx extends CodeGenerator {
  static generatorName = "Typescript-Klassen mit MobX";

  static generatorId = "basictypescriptmobx";

  static defaultBaseDir = "ts/mobx";

  buildDefaultValue(prop: Property) {
    if (prop.optional) return null;
    if (prop.array) return "[]";

    switch (prop.type) {
      case "string":
        return `""`;
      case "boolean":
        return "false";
      case "double":
      case "int":
        return "0";
      case "Date":
        return "new Date(0)";
    }

    if (typeof prop.type !== "string") {
      return `new ${prop.type.name}()`;
    }

    return null;
  }

  buildProp(prop: Property) {
    const propTypeStr =
      typeof prop.type === "string"
        ? propTypeMap[prop.type]
        : `${prop.type.name}`;

    const defaultValue = this.buildDefaultValue(prop);

    return `@observable ${prop.name}${
      prop.optional ? "?" : ""
    }: ${propTypeStr}${prop.array ? "[]" : ""}${
      defaultValue ? `= ${defaultValue}` : ""
    };`;
  }

  buildConstructor(model: Model) {
    const isRoot = !model.parent;
    return `constructor() {
    ${!isRoot && "super()"};
    makeObservable(this);
  }`;
  }

  generateModel(model: Model) {
    const basicMetadata = this.schema.generators.get("customtypescriptmobx");
    const basicOutDir =
      basicMetadata?.outDir ?? CustomTypescriptMobx.defaultBaseDir;
    const relativeBasicOutDir = p.relative(this.baseDir, basicOutDir);

    const imports = buildImports(model, { baseDir: relativeBasicOutDir }).join(
      "\n"
    );
    const isRoot = !model.parent;

    const { parent } = model;

    return `import { observable, makeObservable } from "mobx";
${imports}${imports.length ? "\n\n" : "\n"}// Generated file. DO NOT EDIT!
export default abstract class Generated${model.name}${
      parent ? ` extends ${parent.name}` : ""
    } {
  ${isRoot ? `@observable _id: string = "";\n  ` : ""}${model.properties
      .map((prop) => this.buildProp(prop))
      .join("\n  ")}

  ${this.buildConstructor(model)} 
}
`;
  }

  getFileName(model: Model) {
    return `Generated${model.name}.ts`;
  }
}
