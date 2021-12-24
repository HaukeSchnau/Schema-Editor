import Model from "../model/model";
import Property, { DataType } from "../model/property";
import CodeGenerator from "./CodeGenerator";
import { toSnakeCase } from "./stringUtil";

const propTypeMap = {
  Mixed: "dynamic",
  int: "int",
  double: "double",
  string: "String",
  boolean: "bool",
  Date: "DateTime",
};

export default class BasicDartMobxGenerator extends CodeGenerator {
  constructor() {
    super();
    this.baseDir = "dart/gen";
  }

  static generatorName = "Basic Dart-Klassen mit MobX für Flutter";

  buildProp(prop: Property) {
    const basicPropType =
      typeof prop.type === "string" ? propTypeMap[prop.type] : prop.type.name;

    const propTypeStr = prop.array
      ? `ObservableList<${basicPropType}>`
      : basicPropType;

    return `@observable
  ${propTypeStr}${prop.optional ? "?" : ""} ${prop.name};`;
  }

  buildImport(type: DataType) {
    if (typeof type === "string") return null;

    return `import './${toSnakeCase(type.name)}.dart';`;
  }

  buildImports(model: Model) {
    model.properties.map((prop) => prop.type).map(this.buildImport);
    const propTypes = [...new Set(model.properties.map((prop) => prop.type))];
    return propTypes
      .map((type) => this.buildImport(type))
      .filter((imp) => !!imp);
  }

  generateModel(model: Model) {
    const imports = this.buildImports(model);
    const name = `Basic${model.name}`;
    const snakeName = toSnakeCase(name);

    return `import 'package:mobx/mobx.dart';
${imports.length ? `${imports.join("\n")}\n` : ""}  
part '${snakeName}.g.dart';

class ${name} = _${name} with _$${name};

// Generated file. DO NOT EDIT!
abstract class _${name} with Store {
  ${model.properties.map(this.buildProp).join("\n\n  ")}
}
`;
  }

  getFileName(model: Model) {
    const name = `Basic${model.name}`;
    const snakeName = toSnakeCase(name);
    return `${snakeName}.dart`;
  }
}
