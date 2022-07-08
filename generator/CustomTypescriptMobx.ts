import Model from "../model/model";
import CodeGenerator from "./CodeGenerator";
import { buildImport } from "./tsUtil";
import p from "path";
import BasicTypescriptMobx from "./BasicTypescriptMobx";
import { LiteralUnion, BuiltInParserName } from "prettier";

export default class CustomTypescriptMobx extends CodeGenerator {
  static generatorName = "Benutzerdefinierte Typescript-Klassen mit MobX";

  static generatorId = "customtypescriptmobx";

  static defaultBaseDir = "ts/mobxcustom";

  public ignoreIfExists = true;

  static language: LiteralUnion<BuiltInParserName, string> = "typescript";

  generateModel(model: Model) {
    const isRoot = !model.parent;
    if (isRoot) return null;

    const basicMetadata = this.schema.generators.get("basictypescriptmobx");
    const basicOutDir =
      basicMetadata?.outDir ?? BasicTypescriptMobx.defaultBaseDir;
    const relativeBasicOutDir = p.relative(this.baseDir, basicOutDir);

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
