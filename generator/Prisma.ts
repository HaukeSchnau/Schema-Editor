import CodeGenerator, { GeneratedFile } from "./CodeGenerator";
import Model from "../model/model";
import Property from "../model/property";
import { pluralize, singularize, toCamelCase } from "./stringUtil";

const propTypeMap = {
  Mixed: "Json",
  int: "Int",
  double: "Float",
  string: "String",
  boolean: "Boolean",
  Date: "DateTime",
};

const buildManyToMany = (name: string, type: Model, relationName: string) => {
  return `${toCamelCase(singularize(name))}Ids String[] @db.ObjectId
  ${toCamelCase(pluralize(name))} ${
    type.name
  }[] @relation("${relationName}", fields: [${toCamelCase(
    singularize(name)
  )}Ids], references: [id])`;
};

const buildProp = (prop: Property) => {
  if (prop.name === "_id")
    return `id String @id @default(auto()) @map("_id") @db.ObjectId`;
  if (typeof prop.type === "string") {
    return `${prop.name} ${propTypeMap[prop.type]}${prop.array ? "[]" : ""}`;
  }

  const isCompositeType = !prop.type.hasDatabaseCollection;
  if (isCompositeType)
    return `${prop.name} ${prop.type.name}${prop.array ? "[]" : ""}`;

  if (prop.array) {
    // Many-to-many
    return buildManyToMany(prop.name, prop.type, prop.name);
  }
  // One-to-many
  return `${prop.name} ${prop.type.name} @relation("${prop.name}", fields: [${prop.name}Id], references: [id])
  ${prop.name}Id String @db.ObjectId`;
};

export default class Prisma extends CodeGenerator {
  static generatorName = "Prisma-Schema";

  static generatorId = "prisma";

  static defaultBaseDir = "prisma";

  generate(): GeneratedFile[] {
    return [{ name: "schema.prisma", contents: this.generatePrismaFile() }];
  }

  buildPrismaModel = (model: Model) => {
    const isReal =
      model.hasDatabaseCollection ||
      this.schema.allModels.find((cand) =>
        cand.properties.find(
          (prop) => prop.type instanceof Model && prop.type.id === model.id
        )
      );
    if (!isReal) return null;

    const relatedModels = this.schema.allModels
      .map((relatedModel) => ({
        model: relatedModel,
        relations: relatedModel.properties.filter(
          (prop) => prop.type instanceof Model && prop.type.id === model.id
        ),
      }))
      .filter(({ relations }) => relations.length);

    return `${model.hasDatabaseCollection ? "model" : "type"} ${model.name} {
  ${model.allProps
    .filter((prop) => model.hasDatabaseCollection || prop.name !== "_id")
    .map(buildProp)
    .join("\n  ")}${
      model.hasDatabaseCollection && relatedModels.length
        ? "\n  " +
          relatedModels
            .map(({ model: relatedModel, relations }) =>
              relations.map((relation) =>
                relation.array
                  ? buildManyToMany(
                      singularize(relation.name) + relatedModel.name,
                      relatedModel,
                      relation.name
                    )
                  : `${toCamelCase(
                      relation.name + pluralize(relatedModel.name)
                    )} ${relatedModel.name}[] @relation("${relation.name}")`
              )
            )
            .flat()
            .join("\n  ")
        : ""
    }
}`;
  };

  generatePrismaFile() {
    return `datasource db {
  url      = env("DATABASE_URL")
  provider = "mongodb"
}

generator client {
  provider = "prisma-client-js"
}

${this.schema.root.allChildren
  .map((model) => this.buildPrismaModel(model))
  .filter((code) => !!code)
  .join("\n\n")}
`;
  }
}
