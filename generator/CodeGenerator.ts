import fs from "fs/promises";
import p from "path";
import Model from "../model/model";
import Schema from "../model/schema";

export default class CodeGenerator {
  outDir: string;

  constructor(outDir: string) {
    this.outDir = outDir;
  }

  async generate(schema: Schema) {
    await fs.mkdir(this.outDir, { recursive: true });
    await Promise.all(
      schema.models.map(async (model) => {
        const filePath = p.join(this.outDir, this.getFileName(model));
        const str = this.generateModel(model);
        if (str) await fs.writeFile(filePath, str);
      })
    );
  }

  generateModel(_model: Model): string | null {
    return "";
  }

  getFileName(model: Model) {
    return model.name;
  }
}
