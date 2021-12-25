import Model from "../model/model";
import Property from "../model/property";
import CodeGenerator from "./CodeGenerator";
import { buildImports, propTypeMap } from "./dartUtil";
import { toSnakeCase } from "./stringUtil";

export default class CustomDartMobxGenerator extends CodeGenerator {
  constructor() {
    super();
    this.baseDir = "dart/model";
    this.ignoreIfExists = true;
  }

  static generatorName = "Editierbare Dart-Klassen mit MobX für Flutter";

  buildPropTypeString(prop: Property) {
    const basicPropType =
      typeof prop.type === "string" ? propTypeMap[prop.type] : prop.type.name;

    return prop.array ? `ObservableList<${basicPropType}>` : basicPropType;
  }

  buildProp(prop: Property) {
    return `@observable
  ${this.buildPropTypeString(prop)}${prop.optional ? "?" : ""} ${prop.name};`;
  }

  buildParentConstructorArg(prop: Property) {
    const isOptional = prop.optional || prop.defaultValue;
    return `${!isOptional ? "required " : ""}${this.buildPropTypeString(prop)}${
      isOptional ? "?" : ""
    } ${prop.name}`;
  }

  buildConstructor(model: Model) {
    const parentProps = model.getAllParentProps();
    const allProps = [...model.properties, ...parentProps];
    return `${model.name}(
      {${[...allProps.map((prop) => this.buildParentConstructorArg(prop))].join(
        ",\n      "
      )}})${
      allProps.length
        ? ` : super(${allProps
            .map((prop) => `${prop.name}: ${prop.name}`)
            .join(", ")})`
        : ""
    };`;
  }

  buildFromJson(model: Model) {
    return `${model.name}.fromJson(Map<String, dynamic> json) : super.fromJson(json);`;
  }

  generateModel(model: Model) {
    const { name } = model;
    const imports = buildImports(model);
    const snakeName = toSnakeCase(name);

    return `import 'package:mobx/mobx.dart';
import '../gen/basic_${snakeName}.dart';
${imports.length ? `${imports.join("\n")}\n` : ""}  
class ${name} extends Basic${name} {
  ${this.buildConstructor(model)}

  ${this.buildFromJson(model)}
}
`;
  }

  getFileName(model: Model) {
    return `${toSnakeCase(model.name)}.dart`;
  }
}
