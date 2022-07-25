import p from "path";
import { LiteralUnion, BuiltInParserName } from "prettier";
import { z } from "zod";
import Model from "../../model/model";
import CodeGenerator, { baseConfigSchema } from "../CodeGenerator";
import { buildImport } from "../util/tsUtil";

const configSchema = baseConfigSchema.extend({
  basicBaseDir: z.string(),
});

export default class CustomTypescriptMobx extends CodeGenerator<
  z.infer<typeof configSchema>
> {
  public ignoreIfExists = true;

  static readonly language: LiteralUnion<BuiltInParserName, string> =
    "typescript";

  static readonly configSchema = configSchema;

  generateModel(model: Model) {
    const isRoot = !model.parent;
    if (isRoot) return null;

    const basicOutDir = this.config.basicBaseDir;
    const relativeBasicOutDir = p.relative(this.config.baseDir, basicOutDir);

    const imports = buildImport(model, {
      baseDir: relativeBasicOutDir,
      prefix: "Generated",
    });

    return `${imports}

export default class ${model.name} extends Generated${model.name} {

}
`;
  }

  getFileName(model: Model) {
    return `${model.name}.ts`;
  }
}
