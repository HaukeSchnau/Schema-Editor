import p from "path";
import Schema from "../../model/schema";
import { BaseGeneratorConfig } from "../CodeGenerator";
import { CombinedCodeGenerator } from "../CombinedCodeGenerator";

export default class DartMobxGenerator extends CombinedCodeGenerator<
  "basicDartMobx" | "customDartMobx"
> {
  static readonly generatorName = "Dart MobX";

  constructor(schema: Schema, config: BaseGeneratorConfig) {
    super(schema, {
      basicDartMobx: {
        baseDir: p.join(config.baseDir, "gen"),
      },
      customDartMobx: {
        baseDir: p.join(config.baseDir, "model"),
      },
      ...config,
    });
  }
}
