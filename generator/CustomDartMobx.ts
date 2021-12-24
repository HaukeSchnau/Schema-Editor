import Model from "../model/model";
import CodeGenerator from "./CodeGenerator";
import { toSnakeCase } from "./stringUtil";

export default class CustomDartMobxGenerator extends CodeGenerator {
  constructor() {
    super();
    this.baseDir = "dart/model";
    this.ignoreIfExists = true;
  }

  static generatorName = "Editierbare Dart-Klassen mit MobX für Flutter";

  generateModel(model: Model) {
    const { name } = model;
    const snakeName = toSnakeCase(name);

    return `import '../gen/basic_${snakeName}.dart';

class ${name} extends Basic${name} {

}
`;
  }

  getFileName(model: Model) {
    return `${toSnakeCase(model.name)}.dart`;
  }
}
