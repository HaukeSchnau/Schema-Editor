import p from "path";
import Schema from "../../model/schema";
import { BaseGeneratorConfig } from "../CodeGenerator";
import { CombinedCodeGenerator } from "../CombinedCodeGenerator";

export default class MongooseGenerator extends CombinedCodeGenerator<
  "tsBasic" | "typescriptMongoose"
> {
  static readonly generatorName = "Mongoose";

  constructor(schema: Schema, config: BaseGeneratorConfig) {
    const basicBaseDir = p.join(config.baseDir, "gen/model");

    super(schema, {
      tsBasic: {
        baseDir: basicBaseDir,
      },
      typescriptMongoose: {
        baseDir: p.join(config.baseDir, "gen/db"),
        basicBaseDir,
      },
      ...config,
    });
  }
}
