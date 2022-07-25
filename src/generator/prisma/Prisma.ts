import { z } from "zod";
import Schema from "../../model/schema";
import { baseConfigSchema } from "../CodeGenerator";
import { CombinedCodeGenerator } from "../CombinedCodeGenerator";

const configSchema = baseConfigSchema.extend({
  variant: z.enum(["mongo", "postgres"]).describe("Datenbank").default("mongo"),
});

export default class PrismaGenerator extends CombinedCodeGenerator<
  "prismaMongo" | "prismaPostgres",
  z.infer<typeof configSchema>
> {
  static readonly generatorName = "Prisma";

  static readonly configSchema = configSchema;

  constructor(schema: Schema, config: z.infer<typeof configSchema>) {
    super(schema, {
      prismaMongo: {
        baseDir: config.baseDir,
        disabled: config.variant !== "mongo",
      },
      prismaPostgres: {
        baseDir: config.baseDir,
        disabled: config.variant !== "postgres",
      },
      ...config,
    });
  }
}
