import type { TypesaurusCore as Core } from "./core.js";

/**
 * Shared types namespaces. It contains types that defines sharing entity
 * functionality.
 */
export namespace TypesaurusShared {
  /**
   * The ref as function that narrows the type to shared ref type. When models
   * don't match, it resolves `unknown`.
   */
  export interface RefAs<Def extends Core.DocDef> {
    <
      Model extends Core.ModelObjectType,
    >(): Core.DocModelOrUnknown<Def> extends Model ? Ref<Model> : unknown;
  }

  /**
   * The doc as function that narrows the type to shared doc type. When models
   * don't match, it resolves `unknown`.
   */
  export interface DocAs<Def extends Core.DocDef, Props extends Core.DocProps> {
    <
      Model extends Core.ModelObjectType,
    >(): Core.DocModelOrUnknown<Def> extends Model
      ? Doc<Model, Props>
      : unknown;
  }

  /**
   * Shared collection type. Unlike regular collection, shared collection
   * lacks methods which type-safety depends on knowing the full type of
   * the model: `add`, `set`, `upset`, and `update`.
   */
  export interface Collection<Model extends Core.ModelObjectType>
    extends Omit<
      Core.Collection<Def<Model>>,
      "add" | "set" | "upset" | "update" | "as"
    > {}

  /**
   * Shared ref type. Unlike regular ref, shared ref lacks methods which
   * type-safety depends on knowing the full type of the model: `set`, `upset`,
   * and `as`. The `collection` is also limited. See {@link Collection}.
   */
  export interface Ref<Model extends Core.ModelObjectType>
    extends Omit<Core.Ref<Def<Model>>, "set" | "upset" | "as" | "collection"> {
    /** The ref's collection. */
    collection: Collection<Model>;
  }

  /**
   * Shared doc type. Unlike regular doc, shared doc lacks methods which
   * type-safety depends on knowing the full type of the model: `set`, `upset`,
   * and `as`. The `ref` is also limited. See {@link Ref}.
   */
  export interface Doc<
    Model extends Core.ModelObjectType,
    Props extends Core.DocProps,
  > extends Omit<Core.Doc<Def<Model>, Props>, "set" | "upset" | "as" | "ref"> {
    /** The doc's ref. */
    ref: Ref<Model>;
  }

  /**
   * Shared def type. Constructs the def type from the object model type to be
   * used when extending regular collection, ref, and doc types to shared.
   */
  export type Def<Model extends Core.ModelObjectType> = {
    Model: Model;
    Name: string;
    Id: string;
    WideModel: Model;
    Flags: { Reduced: false; Shared: true };
  };
}
