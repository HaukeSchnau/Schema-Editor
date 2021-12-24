import BasicTypescript from "./BasicTypescript";
import CodeGenerator from "./CodeGenerator";
import DartMobxGenerator from "./DartMobx";
import TypeScriptMongooseGenerator from "./TypeScriptMongoose";

export default new Map<string, typeof CodeGenerator>(
  Object.entries({
    tsbasic: BasicTypescript,
    tsmongoose: TypeScriptMongooseGenerator,
    dartmobx: DartMobxGenerator,
  })
);
