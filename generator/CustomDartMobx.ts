import Model from "../model/model";
import Property from "../model/property";
import CodeGenerator from "./CodeGenerator";
import { buildImports, propTypeMap } from "./dartUtil";
import { toSnakeCase } from "./stringUtil";

export default class CustomDartMobxGenerator extends CodeGenerator {
  static generatorName = "Editierbare Dart-Klassen mit MobX für Flutter";

  static generatorId = "customdartmobx";

  static defaultBaseDir = "dart/model";

  public ignoreIfExists = true;

  buildPropTypeString(prop: Property) {
    const basicPropType =
      typeof prop.type === "string" ? propTypeMap[prop.type] : prop.type.name;

    return prop.array ? `ObservableList<${basicPropType}>` : basicPropType;
  }

  buildParentConstructorArg(prop: Property) {
    const isOptional = prop.optional || prop.defaultValue;
    return `${!isOptional ? "required " : ""}${this.buildPropTypeString(prop)}${
      isOptional ? "?" : ""
    } ${prop.name}`;
  }

  buildConstructor(model: Model) {
    const isRoot = !model.parent;
    const { allProps } = model;
    return `_${model.name}(
      {${[...allProps.map((prop) => this.buildParentConstructorArg(prop))].join(
        ",\n      "
      )}})${
      isRoot
        ? ` : super(${allProps
            .map((prop) => `${prop.name}: ${prop.name}`)
            .join(", ")})`
        : ""
    };`;
  }

  buildFromJson(model: Model) {
    return `_${model.name}.fromJson(Map<String, dynamic> json) : super.fromJson(json);`;
  }

  generateModel(model: Model) {
    const isRoot = !model.parent;
    if (isRoot) return null;

    const { name } = model;
    const imports = buildImports(model);
    const snakeName = toSnakeCase(name);
    const mobxImport = "import 'package:mobx/mobx.dart';\n";

    return `${mobxImport}import '../gen/basic_${snakeName}.dart';
${imports.length ? `${imports.join("\n")}\n` : ""}  
part '${snakeName}.g.dart';

class ${name} = _${name} with _$${name};

abstract class _${name} extends Basic${name} with Store {
  ${this.buildConstructor(model)}

  // ignore: unused_element
  ${this.buildFromJson(model)}
}
`;
  }

  getFileName(model: Model) {
    return `${toSnakeCase(model.name)}.dart`;
  }
}
