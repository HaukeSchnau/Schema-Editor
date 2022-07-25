#!/usr/bin/env node

import { promises as fs, constants as fsConstants } from "fs";
import { deserialize } from "serializr";
import p from "path";
import Schema from "../model/schema";
import { availableGenerators, GeneratorId } from "./Generators";

function checkFileExists(file: string) {
  return fs
    .access(file, fsConstants.F_OK)
    .then(() => true)
    .catch(() => false);
}

(async () => {
  const filename = process.argv[2] || "schema.json";
  const outDir = process.argv[3] || ".";

  const json = await fs.readFile(filename, { encoding: "utf-8" });
  const schema = deserialize<Schema>(Schema, JSON.parse(json));
  schema.root.link();

  const targets = Object.keys(schema.generators) as GeneratorId[];

  await Promise.all(
    targets.map(async (target) => {
      const generatorConfig = schema.generators[target];
      const Generator = availableGenerators[target];
      if (!generatorConfig || !Generator)
        throw new Error(`Invalid target: ${target}`);

      console.log(`Generating ${target}...`);

      const parsedConfig = Generator.configSchema.safeParse(generatorConfig);
      if (!parsedConfig.success)
        throw new Error(`Invalid config for ${target}: ${parsedConfig.error}`);

      const generator = new Generator(schema, parsedConfig.data);

      const generatedFiles = generator.generate();
      await Promise.all(
        generatedFiles.map(async (file) => {
          const filePath = p.join(outDir, file.path);
          const baseDir = p.dirname(filePath);
          await fs.mkdir(baseDir, { recursive: true });

          if (generator.ignoreIfExists && (await checkFileExists(filePath)))
            return;
          await fs.writeFile(filePath, file.contents);
        })
      );
    })
  );
})();
