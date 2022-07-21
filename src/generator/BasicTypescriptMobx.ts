import p from "path";
import { BuiltInParserName, LiteralUnion } from "prettier";
import Model from "../model/model";
import Property, { DataType } from "../model/property";
import CodeGenerator from "./CodeGenerator";
import CustomTypescriptMobx from "./CustomTypescriptMobx";
import { buildImports, propTypeMap } from "./tsUtil";

export default class BasicTypescriptMobx extends CodeGenerator {
  static generatorName = "Typescript-Klassen mit MobX";

  static generatorId = "basictypescriptmobx";

  static defaultBaseDir = "ts/mobx";

  static language: LiteralUnion<BuiltInParserName, string> = "typescript";

  buildDefaultValue(prop: Property) {
    if (prop.optional) return "undefined";
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
      default:
    }

    if (typeof prop.type !== "string") {
      return `new ${prop.type.name}()`;
    }

    return "undefined";
  }

  getDataTypeStr(type: DataType) {
    if (typeof type === "string") {
      return propTypeMap[type];
    }

    return type.name;
  }

  getPropTypeStr(prop: Property) {
    const dataTypeStr = this.getDataTypeStr(prop.type);

    return `${prop.lazy ? `Lazy<${dataTypeStr}>` : dataTypeStr}${
      prop.array ? "[]" : ""
    }`;
  }

  buildProp(prop: Property) {
    return `@observable ${prop.name}${
      prop.optional ? "?" : ""
    }: ${this.getPropTypeStr(prop)};`;
  }

  buildConstructor(model: Model) {
    const isRoot = !model.parent;

    const { allProps } = model;

    const dataType = `{
      ${allProps.map((prop) => `${prop.name}?: ${this.getPropTypeStr(prop)}`)}
    }`;

    const constructorArg = `{
      ${allProps.map((prop) => prop.name).join(", ")}
    }: ${dataType} = {}`;
    const superArgs = model.parent?.allProps
      .map((prop) => prop.name)
      .join(", ");

    const assignments = allProps
      .map(
        (prop) =>
          `this.${prop.name} = ${prop.name} ?? ${this.buildDefaultValue(prop)};`
      )
      .join("\n");

    return `constructor();
    constructor(data: ${dataType});
    constructor(${constructorArg}) {
    ${!isRoot && `super(${!model.parent?.parent ? "" : `{${superArgs}}`})`};
    makeObservable(this);
    ${assignments}
    this.init();
  }`;
  }

  generateModel(model: Model) {
    const { parent } = model;
    const isRoot = !parent;

    if (isRoot) return null;

    const basicMetadata = this.schema.generators.get("customtypescriptmobx");
    const basicOutDir =
      basicMetadata?.outDir ?? CustomTypescriptMobx.defaultBaseDir;
    const relativeBasicOutDir = p.relative(this.baseDir, basicOutDir);

    const imports = buildImports(model, {
      baseDir: relativeBasicOutDir,
      rootImport: `import { Entity } from "login-solutions-common-frontend";`,
    }).join("\n");

    return `import { observable, makeObservable } from "mobx";
import { Lazy } from "login-solutions-common-frontend";
${imports}${imports.length ? "\n\n" : "\n"}// Generated file. DO NOT EDIT!
export default abstract class Generated${model.name}${
      parent ? ` extends ${parent.name}` : ""
    } {
  
  protected readonly __$classname: string = "${model.name}";
  protected static readonly __$classname: string = "${model.name}";

  ${isRoot ? `@observable _id: string = "";\n  ` : ""}${model.properties
      .map((prop) => this.buildProp(prop))
      .join("\n  ")}

  ${this.buildConstructor(model)} 

  init() {}
}
`;
  }

  getFileName(model: Model) {
    return `Generated${model.name}.ts`;
  }
}
