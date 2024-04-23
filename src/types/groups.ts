import type { TypesaurusCore as Core } from "./core.js";
import { TypesaurusShared as Shared } from "./shared.js";
import type { TypesaurusUtils as Utils } from "./utils.js";

export declare const groups: TypesaurusGroups.Function;

export namespace TypesaurusGroups {
  export interface Function {
    <DB extends Core.DB<any>>(
      db: DB,
    ): DB extends Core.DB<infer Schema> ? Groups<Schema> : never;
  }

  export interface Group<Def extends Core.DocDef>
    extends Core.CollectionAPI<Def> {
    /** The group type */
    type: "group";

    /** The group name */
    name: string;

    /**
     * The function narrows the type to shared group type. Unlike regular
     * group, shared group lacks methods which type-safety depends on
     * knowing the full type of the model: `set`, `upset`, and `as`. The `ref`
     * is also limited.
     *
     * When models don't match, it resolves `unknown`.
     */
    as: Shared.GroupAs<Def>;
  }

  /**
   * The type flattens the schema and generates groups from nested and
   * root collections.
   */
  export type Groups<Schema> =
    /**
     * {@link ConstructGroups} here plays a role of merger, each level of nesting
     * returns respective collections and the type creates an object from those,
     * inferring the Model (`PostComment | UpdateComment`).
     */
    ConstructGroups<
      GroupsLevel1<Schema>,
      GroupsLevel2<Schema>,
      GroupsLevel3<Schema>,
      GroupsLevel4<Schema>,
      GroupsLevel5<Schema>,
      GroupsLevel6<Schema>,
      GroupsLevel7<Schema>,
      GroupsLevel8<Schema>,
      GroupsLevel9<Schema>,
      GroupsLevel10<Schema>
    >;

  /**
   * The type merges extracted collections into groups.
   */
  export type ConstructGroups<
    Schema1,
    Schema2,
    Schema3,
    Schema4,
    Schema5,
    Schema6,
    Schema7,
    Schema8,
    Schema9,
    Schema10,
  > =
    | Schema1
    | Schema2
    | Schema3
    | Schema4
    | Schema5
    | Schema6
    | Schema7
    | Schema8
    | Schema9
    | Schema10 extends infer Schema
    ? {
        [Key in Utils.UnionKeys<Schema>]: Group<
          Schema extends Record<Key, infer Def extends Core.DocDef>
            ? Def
            : never
        >;
      }
    : never;

  export type GroupsLevel1<Schema, BasePath extends string | false = false> = {
    // Use the custom name if found
    [Name in Utils.UnionKeys<Schema> as Schema[Name] extends
      | Core.NestedPlainCollection<any, any, any, infer CustomName>
      | Core.PlainCollection<any, any, infer CustomName>
      ? CustomName extends string
        ? CustomName
        : Name
      : never]: Name extends string
      ? Schema[Name] extends Core.NestedPlainCollection<
          infer Model,
          any,
          infer CustomId,
          infer CustomName
        >
        ? Core.CollectionDef<Name, Model, CustomId, CustomName, BasePath>
        : Schema[Name] extends Core.PlainCollection<
              infer Model,
              infer CustomId,
              infer CustomName
            >
          ? Core.CollectionDef<Name, Model, CustomId, CustomName, BasePath>
          : never
      : never;
  };

  export type GroupsLevel2<Schema, BasePath extends string | false = false> =
    // Infer the nested (2) schema
    {
      [Name in keyof Schema]: Name extends string
        ? Schema[Name] extends Core.NestedPlainCollection<
            any,
            infer NestedSchema,
            any,
            any
          >
          ? GroupsLevel1<NestedSchema, Utils.ComposePath<BasePath, Name>>
          : never
        : never;
    }[keyof Schema];

  export type GroupsLevel3<Schema, BasePath extends string | false = false> =
    // Infer the nested (3) schema
    {
      [Name in keyof Schema]: Name extends string
        ? Schema[Name] extends Core.NestedPlainCollection<
            any,
            infer NestedSchema,
            any,
            any
          >
          ? GroupsLevel2<NestedSchema, Utils.ComposePath<BasePath, Name>>
          : never
        : never;
    }[keyof Schema];

  export type GroupsLevel4<Schema, BasePath extends string | false = false> =
    // Infer the nested (4) schema
    {
      [Name in keyof Schema]: Name extends string
        ? Schema[Name] extends Core.NestedPlainCollection<
            any,
            infer NestedSchema,
            any,
            any
          >
          ? GroupsLevel3<NestedSchema, Utils.ComposePath<BasePath, Name>>
          : never
        : never;
    }[keyof Schema];

  export type GroupsLevel5<Schema, BasePath extends string | false = false> =
    // Infer the nested (5) schema
    {
      [Name in keyof Schema]: Name extends string
        ? Schema[Name] extends Core.NestedPlainCollection<
            any,
            infer NestedSchema,
            any,
            any
          >
          ? GroupsLevel4<NestedSchema, Utils.ComposePath<BasePath, Name>>
          : never
        : never;
    }[keyof Schema];

  export type GroupsLevel6<Schema, BasePath extends string | false = false> =
    // Infer the nested (6) schema
    {
      [Name in keyof Schema]: Name extends string
        ? Schema[Name] extends Core.NestedPlainCollection<
            any,
            infer NestedSchema,
            any,
            any
          >
          ? GroupsLevel5<NestedSchema, Utils.ComposePath<BasePath, Name>>
          : never
        : never;
    }[keyof Schema];

  export type GroupsLevel7<Schema, BasePath extends string | false = false> =
    // Infer the nested (7) schema
    {
      [Name in keyof Schema]: Name extends string
        ? Schema[Name] extends Core.NestedPlainCollection<
            any,
            infer NestedSchema,
            any,
            any
          >
          ? GroupsLevel6<NestedSchema, Utils.ComposePath<BasePath, Name>>
          : never
        : never;
    }[keyof Schema];

  export type GroupsLevel8<Schema, BasePath extends string | false = false> =
    // Infer the nested (8) schema
    {
      [Name in keyof Schema]: Name extends string
        ? Schema[Name] extends Core.NestedPlainCollection<
            any,
            infer NestedSchema,
            any,
            any
          >
          ? GroupsLevel7<NestedSchema, Utils.ComposePath<BasePath, Name>>
          : never
        : never;
    }[keyof Schema];

  export type GroupsLevel9<Schema, BasePath extends string | false = false> =
    // Infer the nested (9) schema
    {
      [Name in keyof Schema]: Name extends string
        ? Schema[Name] extends Core.NestedPlainCollection<
            any,
            infer NestedSchema,
            any,
            any
          >
          ? GroupsLevel8<NestedSchema, Utils.ComposePath<BasePath, Name>>
          : never
        : never;
    }[keyof Schema];

  export type GroupsLevel10<Schema, BasePath extends string | false = false> =
    // Infer the nested (10) schema
    {
      [Name in keyof Schema]: Name extends string
        ? Schema[Name] extends Core.NestedPlainCollection<
            any,
            infer NestedSchema,
            any,
            any
          >
          ? GroupsLevel9<NestedSchema, Utils.ComposePath<BasePath, Name>>
          : never
        : never;
    }[keyof Schema];
}
