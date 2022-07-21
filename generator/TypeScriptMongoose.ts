import p from "path";
import { LiteralUnion, BuiltInParserName } from "prettier";
import Model, { isModelGuard } from "../model/model";
import Property from "../model/property";
import CodeGenerator from "./CodeGenerator";
import BasicTypescript from "./BasicTypescript";

const propTypeMap = {
  Mixed: "Mixed",
  int: "Number",
  double: "Number",
  string: "String",
  boolean: "Boolean",
  Date: "Date",
};

export default class TypeScriptMongooseGenerator extends CodeGenerator {
  static generatorName = "Mongoose mit TypeScript";

  static generatorId = "tsmongoose";

  static defaultBaseDir = "ts/mongoose";

  static language: LiteralUnion<BuiltInParserName, string> = "typescript";

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
      default:
    }

    return null;
  }

  buildProp(prop: Property) {
    let typeStr: string;
    if (typeof prop.type === "string") {
      typeStr = propTypeMap[prop.type];
    } else if (prop.type.hasDatabaseCollection) {
      typeStr = `ObjectId, ref: "${prop.type.name}"`;
    } else {
      typeStr = this.generateModelSchema(prop.type);
    }

    const propTypeStr = `{ type: ${typeStr}, unique: ${
      prop.unique ?? false
    }, required: ${!prop.optional}, default: ${
      this.buildDefaultValue(prop) ?? "undefined"
    } }`;

    const arrayedPropType = prop.array ? `[${propTypeStr}]` : propTypeStr;

    return `${prop.name}: ${arrayedPropType}`;
  }

  generateModelSchema(model: Model): string {
    return `{
  ${model.properties.map((prop) => this.buildProp(prop)).join(",\n  ")}
}`;
  }

  getReferenceDependencies(model: Model): Model[] {
    return model.properties
      .map((prop) => {
        const { type } = prop;
        if (typeof type === "string") return null;
        if (type.hasDatabaseCollection) return type;
        return this.getReferenceDependencies(type);
      })
      .flat()
      .filter(isModelGuard);
  }

  generateModel(model: Model): string | null {
    if (!model.hasDatabaseCollection) return null;

    const referenceDependencies = this.getReferenceDependencies(model);
    const referenceDependenciesRequires = referenceDependencies.map(
      (depedency) => `require("./${depedency.name}");`
    );

    const basicMetadata = this.schema.generators.get("tsbasic");
    const basicOutDir = basicMetadata?.outDir ?? BasicTypescript.defaultBaseDir;
    const relativeBasicOutDir = p.relative(this.baseDir, basicOutDir);

    const mongooseSchema = `const ${model.name}Schema = new Schema<Basic${
      model.name
    }>({
  ${model.properties.map((prop) => this.buildProp(prop)).join(",\n  ")}
});`;

    const imports = `import type { Document, Model } from "mongoose";
import mongoose, { Schema, model } from "mongoose";
import type Basic${model.name} from "${relativeBasicOutDir}/Basic${model.name}";`;

    return `${imports}
${Array.from(new Set(referenceDependenciesRequires)).join("\n")}

const { Mixed, ObjectId } = Schema.Types;

// Generated file. DO NOT EDIT!
    
${mongooseSchema}

${model.name}Schema.set('toJSON', {
  virtuals: true
});

export const ${model.name}DB: Model<Basic${model.name}> = mongoose.models.${
      model.name
    } || model<Basic${model.name}>("${model.name}", ${model.name}Schema);
`;
  }

  getFileName(model: Model) {
    return `${model.name}.ts`;
  }
}
