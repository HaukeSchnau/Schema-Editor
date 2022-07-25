import p from "path";
import Schema from "./model/schema";
import verifyPermission from "./verifyPermission";
import { availableGenerators, GeneratorId } from "./generator/Generators";

async function exists(baseDir: FileSystemDirectoryHandle, fileName: string) {
  try {
    await baseDir.getFileHandle(fileName);
    return true;
  } catch (e) {
    return false;
  }
}

const getDir = async (parent: FileSystemDirectoryHandle, path: string) => {
  let baseDir = parent;
  for (const subdir of path.split("/")) {
    baseDir = await baseDir.getDirectoryHandle(subdir, { create: true });
  }
  return baseDir;
};

export default async (schema: Schema, rootDir: FileSystemDirectoryHandle) => {
  if (!(await verifyPermission(rootDir))) return;
  await Promise.all(
    Object.entries(schema.generators).map(async ([genId, config]) => {
      const Generator = availableGenerators[genId as GeneratorId];
      if (!Generator) throw new Error(`Invalid target: ${genId}`);

      const parsedConfig = Generator.configSchema.safeParse(config);
      if (!parsedConfig.success)
        throw new Error(`Invalid config for ${genId}: ${parsedConfig.error}`);
      const generator = new Generator(schema, parsedConfig.data);

      const generatedFiles = generator.generate();
      await Promise.all(
        generatedFiles.map(async (generatedFile) => {
          const name = p.basename(generatedFile.path);
          const baseDirPath = p.dirname(generatedFile.path);
          const baseDirHandle = await getDir(rootDir, baseDirPath);
          if (generator.ignoreIfExists && (await exists(baseDirHandle, name)))
            return;

          const outFile = await baseDirHandle.getFileHandle(name, {
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
