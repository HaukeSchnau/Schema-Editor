import fs from "fs/promises";
import Schema from "../model/schema";
import { deserialize } from "serializr";
import BasicTypescript from "./BasicTypescript";
import CodeGenerator from "./CodeGenerator";
import TypeScriptMongooseGenerator from "./TypeScriptMongoose";
import DartMobxGenerator from "./DartMobx";

const generators = new Map<string, typeof CodeGenerator>(
  Object.entries({
    tsbasic: BasicTypescript,
    tsmongoose: TypeScriptMongooseGenerator,
    dartmobx: DartMobxGenerator,
  })
);

(async () => {
  const filename = process.argv[2] || "schema.json";
  const outDir = process.argv[3] || "model/gen";
  const targets = process.argv.slice(4) || ["tsbasic"];

  const json = await fs.readFile(filename, { encoding: "utf-8" });
  const schema = deserialize<Schema>(Schema, JSON.parse(json));
  schema.link();

  await Promise.all(
    targets.map(async (target) => {
      const Generator = generators.get(target);
      if (!Generator) throw new Error("Invalid target");

      const generator = new Generator(outDir);
      await generator.generate(schema);
    })
  );
})();
