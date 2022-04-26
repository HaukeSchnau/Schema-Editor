import BasicDartMobxGenerator from "./BasicDartMobx";
import BasicTypescript from "./BasicTypescript";
import CodeGenerator from "./CodeGenerator";
import CustomDartMobxGenerator from "./CustomDartMobx";
import TypeScriptMongooseGenerator from "./TypeScriptMongoose";

const generators: typeof CodeGenerator[] = [
  BasicTypescript,
  TypeScriptMongooseGenerator,
  BasicDartMobxGenerator,
  CustomDartMobxGenerator,
];

export default new Map<string, typeof CodeGenerator>(
  generators.map((gen) => [gen.generatorId, gen])
);
