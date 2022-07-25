import BasicDartMobxGenerator from "./dartMobx/BasicDartMobx";
import CustomDartMobxGenerator from "./dartMobx/CustomDartMobx";
import DartMobxGenerator from "./dartMobx/DartMobx";
import BasicTypescript from "./mongoose/BasicTypescript";
import MongooseGenerator from "./mongoose/Mongoose";
import TypeScriptMongooseGenerator from "./mongoose/TypeScriptMongoose";
import PrismaGenerator from "./prisma/Prisma";
import PrismaMongo from "./prisma/PrismaMongo";
import PrismaPostgres from "./prisma/PrismaPostgres";
import BasicTypescriptMobx from "./typescriptMobx/BasicTypescriptMobx";
import CustomTypescriptMobx from "./typescriptMobx/CustomTypescriptMobx";
import TypeScriptMobxGenerator from "./typescriptMobx/TypeScriptMobx";

export const availableGenerators = {
  // Dart MobX
  dartMobx: DartMobxGenerator,
  basicDartMobx: BasicDartMobxGenerator,
  customDartMobx: CustomDartMobxGenerator,
  // Mongoose
  mongoose: MongooseGenerator,
  typescriptMongoose: TypeScriptMongooseGenerator,
  tsBasic: BasicTypescript,
  // Prisma
  prisma: PrismaGenerator,
  prismaMongo: PrismaMongo,
  prismaPostgres: PrismaPostgres,
  // Typescript MobX
  typescriptMobx: TypeScriptMobxGenerator,
  basicTypescriptMobx: BasicTypescriptMobx,
  customTypescriptMobx: CustomTypescriptMobx,
};

export type GeneratorId = keyof typeof availableGenerators;
