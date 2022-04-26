import GeneratorMetaData from "../model/generatorMetaData";
import Model from "../model/model";
import Schema from "../model/schema";

export type GeneratedFile = {
  name: string;
  contents: string;
};

function isNotNull(arg: GeneratedFile | null): arg is GeneratedFile {
  return arg !== null;
}

export default class CodeGenerator {
  public ignoreIfExists = false;

  static generatorName = "Generator";

  static generatorId = "generator";

  static defaultBaseDir = "gen";

  constructor(public schema: Schema) {}

  generate(): GeneratedFile[] {
    const metaFileContents = this.generateMetaFile(this.schema);
    return [
      ...this.generateSubModels(this.schema.root),
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

  get baseDir() {
    const generator = <typeof CodeGenerator>this.constructor;
    return this.metaData?.outDir || generator.defaultBaseDir;
  }

  get metaData() {
    const generator = <typeof CodeGenerator>this.constructor;
    return this.schema.generators.get(generator.generatorId);
  }
}
