import { makeAutoObservable } from "mobx";
import {
  getDefaultModelSchema,
  identifier,
  list,
  object,
  serializable,
} from "serializr";
import Property, { DataType, PRIMITIVES } from "./property";

export default class Model {
  @serializable
  name: string;

  @serializable(identifier())
  id: string;

  @serializable
  hasDatabaseCollection = true;

  @serializable(list(object(Property)))
  properties: Property[] = [];

  children: Model[] = [];

  parent?: Model;

  constructor(name: string, id: string, parent?: Model) {
    this.name = name;
    this.id = id;
    this.parent = parent;
    makeAutoObservable(this);

    const model = getDefaultModelSchema<Model>(Model);

    if (model)
      model.props.children = list(object(Model), {
        afterDeserialize: (callback, error, newValue) => {
          newValue.forEach((childModel: Model) => {
            childModel.parent = this;
          });
          callback(error, newValue);
        },
      });
  }

  link() {
    const root = this.findRoot();
    this.children.forEach((model) => {
      model.properties.forEach((prop) => {
        const linkedType = root.findLinkedOrPrimitiveType(prop.type);
        if (linkedType) {
          prop.type = linkedType;
        }
      });
      model.link();
    });
  }

  private findRoot(): Model {
    return this.parent?.findRoot() ?? this.parent ?? this;
  }

  private findLinkedOrPrimitiveType(type: DataType) {
    return PRIMITIVES.find((prim) => type === prim)
      ? type
      : this.findLinkedType(type);
  }

  findLinkedType(type: DataType): Model | null {
    for (const child of this.children) {
      if (child.id === type) return child;

      const descendantType = child.findLinkedType(type);
      if (descendantType) return descendantType;
    }
    return null;
  }

  addChild(child: Model) {
    if (child.id === this.id) return;
    child.deleteFromTree();
    child.parent = this;
    this.children.push(child);
  }

  deleteFromTree() {
    this.deleteSibling(this);
  }

  deleteSibling(sibling: Model) {
    const index = this.siblings.findIndex(
      (candidateModel) => candidateModel.id === sibling.id
    );
    if (index > -1) this.siblings.splice(index, 1);
  }

  get siblings() {
    return this.parent?.children ?? [];
  }

  getAllParentProps(): Property[] {
    return [
      ...(this.parent?.properties || []),
      ...(this.parent?.getAllParentProps() || []),
    ];
  }

  get allChildren(): Model[] {
    return [
      ...this.children,
      ...this.children.map((child) => child.allChildren),
    ].flat();
  }

  get uniquePropTypes(): DataType[] {
    return [
      ...new Set([
        ...this.properties.map((prop) => prop.type),
        ...(this.parent?.uniquePropTypes ?? []),
      ]),
    ];
  }

  get allProps(): Property[] {
    return [...this.properties, ...(this.parent?.allProps ?? [])];
  }
}

export const isModelGuard = (o: unknown): o is Model => o instanceof Model;