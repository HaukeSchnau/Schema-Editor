import Model from "../model/model";
import Property from "../model/property";
import CodeGenerator from "./CodeGenerator";
import { buildImports } from "./dartUtil";
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
  static generatorName = "Basic Dart-Klassen mit MobX für Flutter";

  static defaultBaseDir = "dart/gen";

  buildPropTypeString(prop: Property) {
    const basicPropType =
      typeof prop.type === "string" ? propTypeMap[prop.type] : prop.type.name;

    return prop.array ? `ObservableList<${basicPropType}>` : basicPropType;
  }

  buildProp(prop: Property) {
    return `@observable
  ${this.buildPropTypeString(prop)}${prop.optional ? "?" : ""} ${prop.name};`;
  }

  buildDefaultValue(prop: Property) {
    return prop.defaultValue;
  }

  buildParentConstructorArg(prop: Property) {
    const isOptional = prop.optional || prop.defaultValue;
    return `${!isOptional ? "required " : ""}${this.buildPropTypeString(prop)}${
      isOptional ? "?" : ""
    } ${prop.name}`;
  }

  buildConstructorArg(prop: Property) {
    const optional = !!(prop.optional || prop.defaultValue);
    return `${optional ? "" : "required "}this.${prop.name}${
      prop.defaultValue ? ` = ${this.buildDefaultValue(prop)}` : ""
    }`;
  }

  buildConstructor(model: Model) {
    const parentProps = model.getAllParentProps();
    const name = `Basic${model.name}`;
    return `_${name}(
      {${[
        ...model.properties.map((prop) => this.buildConstructorArg(prop)),
        ...parentProps.map((prop) => this.buildParentConstructorArg(prop)),
      ].join(",\n      ")}})${
      parentProps.length
        ? ` : super(${parentProps
            .map((prop) => `${prop.name}: ${prop.name}`)
            .join(", ")})`
        : ""
    };`;
  }

  buildToJsonProp(prop: Property) {
    const toJsonAppendix = typeof prop.type === "string" ? "" : ".toJson()";
    const convertDate = prop.type === "Date" ? ".millisecondsSinceEpoch" : "";
    const optional =
      prop.optional && (convertDate || toJsonAppendix) ? "?" : "";
    const val = prop.array
      ? `${prop.name}.map((e) => e${optional}${toJsonAppendix}${convertDate}).toList()`
      : prop.name + optional + toJsonAppendix + convertDate;
    return `"${prop.name}": ${val}`;
  }

  buildToJson(model: Model) {
    const isRoot = !model.parent;
    return `${isRoot ? "" : "@override\n  "}Map<String, dynamic> toJson() {
    return {
      ${model.properties
        .map((prop) => this.buildToJsonProp(prop))
        .join(",\n      ")}${isRoot ? "" : `,\n      ...super.toJson()`}
    };
  }`;
  }

  buildFromJsonValue(prop: Property) {
    const defaultValue = prop.defaultValue ? ` ?? ${prop.defaultValue}` : "";

    const deserialize = (varPath: string) => {
      if (prop.type === "Date")
        return `DateTime.fromMillisecondsSinceEpoch(${varPath})`;
      if (typeof prop.type === "string") return varPath;

      return `${prop.type.name}.fromJson(${varPath})`;
    };

    const value = prop.array
      ? `ObservableList.of(json["${prop.name}"].map((e) => ${deserialize(
          "e"
        )}))`
      : deserialize(`json["${prop.name}"]`);
    return `${value}${defaultValue}`;
  }

  buildFromJsonProp(prop: Property) {
    return `${prop.name} = ${this.buildFromJsonValue(prop)}`;
  }

  buildFromJson(model: Model) {
    const parentProps = model.getAllParentProps();
    return `// ignore: unused_element
  _Basic${model.name}.fromJson(Map<String, dynamic> json) 
      : ${model.properties
        .map((prop) => this.buildFromJsonProp(prop))
        .join(",\n        ")}${
      model.parent
        ? `,\n        super(${parentProps.map(
            (prop) => `${prop.name}: ${this.buildFromJsonValue(prop)}`
          )})`
        : ""
    };`;
  }

  generateModel(model: Model) {
    const imports = buildImports(model);
    const name = `Basic${model.name}`;
    const snakeName = toSnakeCase(name);

    return `import 'package:mobx/mobx.dart';
${
  model.parent
    ? `import '../model/${toSnakeCase(model.parent.name)}.dart';`
    : ""
}
${imports.length ? `${imports.join("\n")}\n` : ""}  
part '${snakeName}.g.dart';

abstract class ${name} = _${name} with _$${name};

// Generated file. DO NOT EDIT!
abstract class _${name} ${
      model.parent ? `extends ${model.parent.name} ` : ""
    }with Store {
  ${model.properties.map((prop) => this.buildProp(prop)).join("\n\n  ")}

  ${this.buildConstructor(model)}

  ${this.buildFromJson(model)}

  ${this.buildToJson(model)}
}
`;
  }

  getFileName(model: Model) {
    const name = `Basic${model.name}`;
    const snakeName = toSnakeCase(name);
    return `${snakeName}.dart`;
  }
}
