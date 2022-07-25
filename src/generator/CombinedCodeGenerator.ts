import Schema from "../model/schema";
import CodeGenerator, {
  BaseGeneratorConfig,
  GeneratedFile,
  GetConfigForGenerator,
} from "./CodeGenerator";
import { availableGenerators, GeneratorId } from "./Generators";

type CombinedGenerators = GeneratorId;

type CombinedConfig<Gens extends CombinedGenerators> = {
  [key in Gens]: GetConfigForGenerator<key> & BaseCombinedConfig;
};

type BaseCombinedConfig = {
  disabled?: boolean;
};

export class CombinedCodeGenerator<
  Generators extends CombinedGenerators,
  Config extends BaseGeneratorConfig = BaseGeneratorConfig
> extends CodeGenerator<CombinedConfig<Generators> & Config> {
  protected generators: CodeGenerator[] = [];

  constructor(schema: Schema, config: CombinedConfig<Generators> & Config) {
    super(schema, config);

    Object.entries(config).forEach(([key, value]) => {
      const Generator = availableGenerators[key as GeneratorId];
      if (!Generator || (value as BaseCombinedConfig).disabled) return;

      this.generators.push(new Generator(schema, value as never));
    });
  }

  public generate(): GeneratedFile[] {
    return this.generators.map((generator) => generator.generate()).flat();
  }
}
