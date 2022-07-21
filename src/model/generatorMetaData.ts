import { makeAutoObservable } from "mobx";
import { serializable } from "serializr";

export default class GeneratorMetaData {
  @serializable
  outDir: string;

  @serializable
  export: boolean;

  constructor(outDir: string, shouldExport: boolean) {
    this.outDir = outDir;
    this.export = shouldExport;
    makeAutoObservable(this);
  }
}
