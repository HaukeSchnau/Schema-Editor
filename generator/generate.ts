import fs from "fs/promises";
import { deserialize } from "serializr";
import p from "path";
import Schema from "../model/schema";
import Generators from "./Generators";

(async () => {
  const filename = process.argv[2] || "schema.json";
  const outDir = process.argv[3] || "model/gen";
  const targets = process.argv.slice(4) || ["tsbasic"];

  const json = await fs.readFile(filename, { encoding: "utf-8" });
  const schema = deserialize<Schema>(Schema, JSON.parse(json));
  schema.link();

  await Promise.all(
    targets.map(async (target) => {
      const Generator = Generators.get(target);
      if (!Generator) throw new Error("Invalid target");

      const generator = new Generator();
      const baseDir = p.join(outDir, generator.baseDir);
      await fs.mkdir(baseDir, { recursive: true });
      const generatedFiles = generator.generate(schema);
      await Promise.all(
        generatedFiles.map(async (file) => {
          await fs.writeFile(p.join(baseDir, file.name), file.contents);
        })
      );
    })
  );
})();
