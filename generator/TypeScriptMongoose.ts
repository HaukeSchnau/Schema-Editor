import Model from "../model/model";
import Property from "../model/property";
import CodeGenerator from "./CodeGenerator";
import p from "path";
import { pluralize } from "./stringUtil";

const propTypeMap = {
  Mixed: "Mixed",
  int: "Number",
  double: "Number",
  string: "String",
  boolean: "Boolean",
  Date: "Date",
};

export default class TypeScriptMongooseGenerator extends CodeGenerator {
  constructor(outDir: string) {
    super(p.join(outDir, "mongoose"));
  }

  buildProp(prop: Property) {
    const propTypeStr =
      typeof prop.type === "string"
        ? propTypeMap[prop.type]
        : prop.type.hasDatabaseCollection
        ? `{ type: ObjectId, ref: "${prop.type.name}" }`
        : this.generateModelSchema(prop.type);

    const arrayedPropType = prop.array ? `[${propTypeStr}]` : propTypeStr;

    return `${prop.name}: ${arrayedPropType}`;
  }

  generateModelSchema(model: Model): string {
    return `{
  ${model.properties.map(this.buildProp).join(",\n  ")}
}`;
  }

  generateModel(model: Model): string | null {
    if (!model.hasDatabaseCollection) return null;

    const document = `export interface ${model.name} extends Document, Basic${model.name} {}`;

    const mongooseSchema = `const ${model.name}Schema = new Schema<Basic${
      model.name
    }>({
  ${model.properties.map(this.buildProp).join(",\n  ")}
});`;

    const imports = `import type { Document } from "mongoose";
import { Schema, model } from "mongoose";
import type Basic${model.name} from "../base/Basic${model.name}";`;

    return `${imports}

const { Mixed, ObjectId } = Schema.Types;

${document}
    
${mongooseSchema}

export const ${pluralize(model.name)} = model<Basic${model.name}>("${
      model.name
    }", ${model.name}Schema);
`;
  }

  getFileName(model: Model) {
    return `${model.name}.ts`;
  }
}
