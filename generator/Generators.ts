import BasicDartMobxGenerator from "./BasicDartMobx";
import BasicTypescript from "./BasicTypescript";
import BasicTypescriptMobx from "./BasicTypescriptMobx";
import CodeGenerator from "./CodeGenerator";
import CustomDartMobxGenerator from "./CustomDartMobx";
import CustomTypescriptMobx from "./CustomTypescriptMobx";
import Prisma from "./Prisma";
import TypeScriptMongooseGenerator from "./TypeScriptMongoose";

const generators: typeof CodeGenerator[] = [
  BasicTypescript,
  TypeScriptMongooseGenerator,
  BasicDartMobxGenerator,
  CustomDartMobxGenerator,
  BasicTypescriptMobx,
  CustomTypescriptMobx,
  Prisma,
];

export default new Map<string, typeof CodeGenerator>(
  generators.map((gen) => [gen.generatorId, gen])
);
