import prettier, { BuiltInParserName, LiteralUnion } from "prettier";
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

  static language: LiteralUnion<BuiltInParserName>;

  // eslint-disable-next-line no-useless-constructor, no-unused-vars, no-empty-function
  constructor(public schema: Schema) {}

  generate(): GeneratedFile[] {
    const metaFileContents = this.generateMetaFile();
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
    const sourceCode = this.generateModel(model);
    if (!sourceCode) return null;

    return {
      name: this.getFileName(model),
      contents: this.language
        ? prettier.format(sourceCode, { parser: this.language })
        : sourceCode,
    };
  }

  generateModel(_model: Model): string | null {
    return "";
  }

  generateMetaFile(): string | null {
    return null;
  }

  getFileName(model: Model) {
    return model.name;
  }

  get language() {
    const generator = <typeof CodeGenerator>this.constructor;
    return generator.language;
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
