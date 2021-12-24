import Model from "../model/model";
import Schema from "../model/schema";

export type GeneratedFile = {
  name: string;
  contents: string;
};

function isNotNull(
  arg: GeneratedFile | null
): arg is Exclude<GeneratedFile, null> {
  return arg !== null;
}

export default class CodeGenerator {
  baseDir = "";

  static generatorName = "Generator";

  generate(schema: Schema): GeneratedFile[] {
    const generatedFiles = schema.models.map((model) => {
      const str = this.generateModel(model);
      if (!str) return null;
      return { name: this.getFileName(model), contents: str };
    });
    return generatedFiles.filter(isNotNull);
  }

  generateModel(_model: Model): string | null {
    return "";
  }

  getFileName(model: Model) {
    return model.name;
  }
}
