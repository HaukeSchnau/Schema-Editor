import p from "path";
import Model from "../../model/model";
import Property from "../../model/property";
import CodeGenerator, { GeneratedFile } from "../CodeGenerator";
import { toCamelCase, pluralize, singularize } from "../util/stringUtil";

const propTypeMap = {
  Mixed: "Json",
  int: "Int",
  double: "Float",
  string: "String",
  boolean: "Boolean",
  Date: "DateTime",
};

const buildManyToMany = (name: string, type: Model) => {
  return `${toCamelCase(pluralize(name))} ${type.name}[] `;
};

const buildProp = (prop: Property) => {
  if (prop.name === "_id") return `id String @id @default(cuid())`;
  if (typeof prop.type === "string") {
    return `${prop.name} ${propTypeMap[prop.type]}${prop.array ? "[]" : ""}`;
  }

  if (prop.array) {
    // Many-to-many
    return buildManyToMany(prop.name, prop.type);
  }
  // One-to-many
  return `${prop.name} ${prop.type.name} @relation("${prop.name}", fields: [${prop.name}Id], references: [id])
  ${prop.name}Id String`;
};

export default class PrismaPostgres extends CodeGenerator {
  generate(): GeneratedFile[] {
    return [
      {
        path: p.join(this.config.baseDir, "schema.prisma"),
        contents: this.generatePrismaFile(),
      },
    ];
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

    return `model ${model.name} {
  ${model.allProps.map(buildProp).join("\n  ")}${
      relatedModels.length
        ? "\n  " +
          relatedModels
            .map(({ model: relatedModel, relations }) =>
              relations.map((relation) =>
                relation.array
                  ? buildManyToMany(
                      singularize(relation.name) + relatedModel.name,
                      relatedModel
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
  provider = "postgresql"
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
