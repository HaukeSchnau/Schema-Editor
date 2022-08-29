import p from "path";
import { LiteralUnion, BuiltInParserName } from "prettier";
import { z } from "zod";
import Model from "../../model/model";
import Property, { DataType } from "../../model/property";
import CodeGenerator, { baseConfigSchema } from "../CodeGenerator";
import { propTypeMap, buildImports } from "../util/tsUtil";

const configSchema = baseConfigSchema.extend({
  customBaseDir: z.string(),
});

export default class BasicTypescriptMobx extends CodeGenerator<
  z.infer<typeof configSchema>
> {
  static readonly language: LiteralUnion<BuiltInParserName, string> =
    "typescript";

  static readonly configSchema = configSchema;

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
    ${assignments}
    makeObservable(this);
    this.init();
  }`;
  }

  generateModel(model: Model) {
    const { parent } = model;
    const isRoot = !parent;

    if (isRoot) return null;

    const basicOutDir = this.config.customBaseDir;
    const relativeBasicOutDir = p.relative(this.config.baseDir, basicOutDir);

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
