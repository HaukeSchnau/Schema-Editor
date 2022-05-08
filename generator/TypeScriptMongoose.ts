import Model, { isModelGuard } from "../model/model";
import Property from "../model/property";
import CodeGenerator from "./CodeGenerator";
import BasicTypescript from "./BasicTypescript";
import p from "path";

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

  buildProp(prop: Property) {
    let propTypeStr: string;
    if (typeof prop.type === "string") {
      propTypeStr = `{ type: ${propTypeMap[prop.type]}, unique: ${
        prop.unique ?? false
      }, required: ${!prop.optional} }`;
    } else if (prop.type.hasDatabaseCollection) {
      propTypeStr = `{ type: ObjectId, ref: "${prop.type.name}", unique: ${
        prop.unique ?? false
      }, required: ${!prop.optional} }`;
    } else {
      propTypeStr = `{ type: ${this.generateModelSchema(prop.type)}, unique: ${
        prop.unique ?? false
      }, required: ${!prop.optional} }`;
    }

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
      (model) => `require("./${model.name}");`
    );

    const basicMetadata = this.schema.generators.get("tsbasic");
    const basicOutDir = basicMetadata?.outDir ?? BasicTypescript.defaultBaseDir;
    const relativeBasicOutDir = p.relative(this.baseDir, basicOutDir);

    const mongooseSchema = `const ${model.name}Schema = new Schema<Basic${
      model.name
    }>({
  ${model.properties.map((prop) => this.buildProp(prop)).join(",\n  ")}
});`;

    const imports = `import type { Document } from "mongoose";
import { Schema, model } from "mongoose";
import type Basic${model.name} from "${relativeBasicOutDir}/Basic${model.name}";`;

    return `${imports}
${referenceDependenciesRequires.join("\n")}

const { Mixed, ObjectId } = Schema.Types;

// Generated file. DO NOT EDIT!
    
${mongooseSchema}

${model.name}Schema.set('toJSON', {
  virtuals: true
});

export const ${model.name}DB = model<Basic${model.name}>("${model.name}", ${
      model.name
    }Schema);
`;
  }

  getFileName(model: Model) {
    return `${model.name}.ts`;
  }
}
