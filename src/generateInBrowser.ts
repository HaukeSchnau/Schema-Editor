import Schema from "../model/schema";
import Generators from "../generator/Generators";
import verifyPermission from "./verifyPermission";

async function exists(baseDir: FileSystemDirectoryHandle, fileName: string) {
  try {
    await baseDir.getFileHandle(fileName);
    return true;
  } catch (e) {
    return false;
  }
}

export default async (
  schema: Schema,
  gens: string[],
  rootDir: FileSystemDirectoryHandle
) => {
  if (!(await verifyPermission(rootDir))) return;
  await Promise.all(
    gens.map(async (generatorId) => {
      const Generator = Generators.get(generatorId);
      if (!Generator) return;
      const generator = new Generator(
        schema.generators.get(generatorId)?.outDir ?? Generator.defaultBaseDir
      );
      const generatedFiles = generator.generate(schema);
      let baseDir = rootDir;
      for (const subdir of generator.baseDir.split("/")) {
        baseDir = await baseDir.getDirectoryHandle(subdir, { create: true });
      }
      await Promise.all(
        generatedFiles.map(async (generatedFile) => {
          if (
            generator.ignoreIfExists &&
            (await exists(baseDir, generatedFile.name))
          )
            return;
          const outFile = await baseDir.getFileHandle(generatedFile.name, {
            create: true,
          });
          const writable = await outFile.createWritable();
          await writable.write(generatedFile.contents);
          await writable.close();
        })
      );
    })
  );
};
