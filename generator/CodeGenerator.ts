import fs from "fs/promises";
import Model from "../model/model";
import Schema from "../model/schema";
import p from "path";

export default class CodeGenerator {
  outDir: string;

  constructor(outDir: string) {
    this.outDir = outDir;
  }

  async generate(schema: Schema) {
    await fs.mkdir(this.outDir, { recursive: true });
    await Promise.all(
      schema.models.map((model) => {
        const filePath = p.join(this.outDir, this.getFileName(model));
        const str = this.generateModel(model);
        if (str) fs.writeFile(filePath, str);
      })
    );
  }

  generateModel(model: Model): string | null {
    return "";
  }

  getFileName(model: Model) {
    return model.name;
  }
}
