import Model from "../model/model";
import Property from "../model/property";
import CodeGenerator from "./CodeGenerator";
import { buildImport, buildImports, propTypeMap } from "./tsUtil";
import p from "path";
import BasicTypescriptMobx from "./BasicTypescriptMobx";

export default class CustomTypescriptMobx extends CodeGenerator {
  static generatorName = "Benutzerdefinierte Typescript-Klassen mit MobX";

  static generatorId = "customtypescriptmobx";

  static defaultBaseDir = "ts/mobxcustom";

  buildConstructor(model: Model) {
    const isRoot = !model.parent;
    return `constructor() {
    super();
  }`;
  }

  generateModel(model: Model) {
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

  ${this.buildConstructor(model)} 
}
`;
  }

  getFileName(model: Model) {
    return `${model.name}.ts`;
  }
}
