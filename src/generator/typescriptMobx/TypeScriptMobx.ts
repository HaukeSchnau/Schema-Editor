import p from "path";
import Schema from "../../model/schema";
import { BaseGeneratorConfig } from "../CodeGenerator";
import { CombinedCodeGenerator } from "../CombinedCodeGenerator";

export default class TypeScriptMobxGenerator extends CombinedCodeGenerator<
  "basicTypescriptMobx" | "customTypescriptMobx"
> {
  static readonly generatorName = "TypeScript MobX";

  constructor(schema: Schema, config: BaseGeneratorConfig) {
    const customBaseDir = p.join(config.baseDir, "model");
    const basicBaseDir = p.join(config.baseDir, "gen");

    super(schema, {
      basicTypescriptMobx: {
        baseDir: basicBaseDir,
        customBaseDir,
      },
      customTypescriptMobx: {
        baseDir: customBaseDir,
        basicBaseDir,
      },
      ...config,
    });
  }
}
