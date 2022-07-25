import prettier, { BuiltInParserName, LiteralUnion } from "prettier";
import p from "path";
import { z, ZodSchema } from "zod";
import Model from "../model/model";
import Schema from "../model/schema";
import { availableGenerators, GeneratorId } from "./Generators";

export type GeneratedFile = {
  path: string;
  contents: string;
};

function isNotNull(arg: GeneratedFile | null): arg is GeneratedFile {
  return arg !== null;
}

export type GetConfig<C extends CodeGenerator> = C extends CodeGenerator<
  infer T
>
  ? T
  : unknown;

export type GetConfigForGenerator<key extends GeneratorId> = GetConfig<
  InstanceType<typeof availableGenerators[key]>
>;

export const baseConfigSchema = z.object({
  baseDir: z.string().describe("Ausgabeordner").default("src"),
});

export type BaseGeneratorConfig = z.infer<typeof baseConfigSchema>;

export default class CodeGenerator<
  Config extends BaseGeneratorConfig = BaseGeneratorConfig
> {
  public ignoreIfExists = false;

  static generatorName = "";

  static language: LiteralUnion<BuiltInParserName>;

  static readonly configSchema: ZodSchema = baseConfigSchema;

  constructor(public schema: Schema, public config: Config) {}

  public generate(): GeneratedFile[] {
    const metaFileContents = this.generateMetaFile();
    return [
      ...this.generateSubModels(this.schema.root),
      metaFileContents
        ? {
            path: p.join(this.config.baseDir, "meta.dart"),
            contents: metaFileContents,
          }
        : null,
    ].filter(isNotNull);
  }

  protected generateSubModels(parent: Model): GeneratedFile[] {
    return [
      this.generateFile(parent),
      ...parent.children.map((child) => this.generateSubModels(child)),
    ]
      .flat()
      .filter(isNotNull);
  }

  protected generateFile(model: Model): GeneratedFile | null {
    const sourceCode = this.generateModel(model);
    if (!sourceCode) return null;

    return {
      path: p.join(this.config.baseDir, this.getFileName(model)),
      contents:
        this.language === "typescript" && typeof window === "undefined"
          ? prettier.format(sourceCode, {
              parser: this.language,
            })
          : sourceCode,
    };
  }

  protected generateModel(_model: Model): string | null {
    return "";
  }

  protected generateMetaFile(): string | null {
    return null;
  }

  protected getFileName(model: Model) {
    return model.name;
  }

  protected get language() {
    const generator = <typeof CodeGenerator>this.constructor;
    return generator.language;
  }
}
