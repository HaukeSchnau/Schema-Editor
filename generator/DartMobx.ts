import p from "path";
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

export default class DartMobxGenerator extends CodeGenerator {
  constructor(outDir: string) {
    super(p.join(outDir, "dartmobx"));
  }

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
    const propTypes = [...new Set(model.properties.map((prop) => prop.type))];
    return propTypes
      .map((type) => this.buildImport(type))
      .filter((imp) => !!imp);
  }

  generateModel(model: Model) {
    const imports = this.buildImports(model);

    return `import 'package:mobx/mobx.dart';
${imports.length ? `${imports.join("\n")}\n` : ""}  
part '${model.name}.g.dart';

class ${model.name} = _${model.name} with _$${model.name};

abstract class _${model.name} with Store {
  ${model.properties.map(this.buildProp).join("\n\n  ")}
}
`;
  }

  getFileName(model: Model) {
    return `${toSnakeCase(model.name)}.dart`;
  }
}
