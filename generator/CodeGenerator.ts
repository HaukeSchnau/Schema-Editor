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

  ignoreIfExists = false;

  static generatorName = "Generator";

  static defaultBaseDir = "gen";

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  generate(schema: Schema): GeneratedFile[] {
    const metaFileContents = this.generateMetaFile(schema);
    return [
      ...this.generateSubModels(schema.root),
      metaFileContents
        ? { name: "meta.dart", contents: metaFileContents }
        : null,
    ].filter(isNotNull);
  }

  generateSubModels(parent: Model): GeneratedFile[] {
    return [
      this.generateFile(parent),
      ...parent.children.map((child) => this.generateSubModels(child)),
    ]
      .flat()
      .filter(isNotNull);
  }

  generateFile(model: Model): GeneratedFile | null {
    const str = this.generateModel(model);
    if (!str) return null;
    return { name: this.getFileName(model), contents: str };
  }

  generateModel(_model: Model): string | null {
    return "";
  }

  generateMetaFile(_schema: Schema): string | null {
    return null;
  }

  getFileName(model: Model) {
    return model.name;
  }
}
