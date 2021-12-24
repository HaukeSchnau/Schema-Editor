import BasicDartMobxGenerator from "./BasicDartMobx";
import BasicTypescript from "./BasicTypescript";
import CodeGenerator from "./CodeGenerator";
import CustomDartMobxGenerator from "./CustomDartMobx";
import TypeScriptMongooseGenerator from "./TypeScriptMongoose";

export default new Map<string, typeof CodeGenerator>(
  Object.entries({
    tsbasic: BasicTypescript,
    tsmongoose: TypeScriptMongooseGenerator,
    basicdartmobx: BasicDartMobxGenerator,
    customdartmobx: CustomDartMobxGenerator,
  })
);
