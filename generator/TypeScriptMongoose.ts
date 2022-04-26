import Model from "../model/model";
import Property from "../model/property";
import CodeGenerator from "./CodeGenerator";
import BasicTypescript from "./BasicTypescript";
import { pluralize } from "./stringUtil";
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
      propTypeStr = propTypeMap[prop.type];
    } else if (prop.type.hasDatabaseCollection) {
      propTypeStr = `{ type: ObjectId, ref: "${prop.type.name}" }`;
    } else {
      propTypeStr = this.generateModelSchema(prop.type);
    }

    const arrayedPropType = prop.array ? `[${propTypeStr}]` : propTypeStr;

    return `${prop.name}: ${arrayedPropType}`;
  }

  generateModelSchema(model: Model): string {
    return `{
  ${model.properties.map((prop) => this.buildProp(prop)).join(",\n  ")}
}`;
  }

  generateModel(model: Model): string | null {
    if (!model.hasDatabaseCollection) return null;

    const basicMetadata = this.schema.generators.get("tsbasic");
    const basicOutDir = basicMetadata?.outDir ?? BasicTypescript.defaultBaseDir;
    const relativeBasicOutDir = p.relative(this.baseDir, basicOutDir);

    const document = `export interface ${model.name} extends Document, Basic${model.name} {}`;

    const mongooseSchema = `const ${model.name}Schema = new Schema<Basic${
      model.name
    }>({
  ${model.properties.map((prop) => this.buildProp(prop)).join(",\n  ")}
});`;

    const imports = `import type { Document } from "mongoose";
import { Schema, model } from "mongoose";
import type Basic${model.name} from "${relativeBasicOutDir}/Basic${model.name}";`;

    return `${imports}

const { Mixed, ObjectId } = Schema.Types;

// Generated file. DO NOT EDIT!

${document}
    
${mongooseSchema}

${model.name}Schema.set('toJSON', {
  virtuals: true
});

export const ${pluralize(model.name)} = model<Basic${model.name}>("${
      model.name
    }", ${model.name}Schema);
`;
  }

  getFileName(model: Model) {
    return `${model.name}.ts`;
  }
}
