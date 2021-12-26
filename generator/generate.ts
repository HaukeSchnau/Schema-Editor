import { promises as fs, constants as fsConstants } from "fs";
import { deserialize } from "serializr";
import p from "path";
import Schema from "../model/schema";
import Generators from "./Generators";

function checkFileExists(file: string) {
  return fs
    .access(file, fsConstants.F_OK)
    .then(() => true)
    .catch(() => false);
}

(async () => {
  const filename = process.argv[2] || "schema.json";
  const outDir = process.argv[3] || "model/gen";
  const targets = process.argv.slice(4) || ["tsbasic"];

  const json = await fs.readFile(filename, { encoding: "utf-8" });
  const schema = deserialize<Schema>(Schema, JSON.parse(json));
  schema.root.link();

  await Promise.all(
    targets.map(async (target) => {
      const Generator = Generators.get(target);
      if (!Generator) throw new Error("Invalid target");

      const generator = new Generator(
        schema.outDirs.get(target) ?? Generator.defaultBaseDir
      );
      const baseDir = p.join(outDir, generator.baseDir);
      await fs.mkdir(baseDir, { recursive: true });
      const generatedFiles = generator.generate(schema);
      await Promise.all(
        generatedFiles.map(async (file) => {
          const path = p.join(baseDir, file.name);
          if (generator.ignoreIfExists && (await checkFileExists(path))) return;
          await fs.writeFile(path, file.contents);
        })
      );
    })
  );
})();
