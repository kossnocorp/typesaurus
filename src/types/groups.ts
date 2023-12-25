import type { TypesaurusCore as Core } from "./core.js";
import type { TypesaurusUtils as Utils } from "./utils.js";

export namespace TypesaurusGroups {
  export interface Function {
    <DB extends Core.DB<any>>(db: DB): Groups<DB>;
  }

  export interface Group<Def extends Core.DocDef>
    extends Core.CollectionAPI<Def> {
    /** The group type */
    type: "group";

    /** The group name */
    name: string;
  }

  /**
   * The type flattens the schema and generates groups from nested and
   * root collections.
   */
  export type Groups<DB extends Core.DB<any>> =
    /**
     * {@link ConstructGroups} here plays a role of merger, each level of nesting
     * returns respective collections and the type creates an object from those,
     * inferring the Model (`PostComment | UpdateComment`).
     */
    ConstructGroups<
      GroupsLevel1<DB>,
      GroupsLevel2<DB>,
      GroupsLevel3<DB>,
      GroupsLevel4<DB>,
      GroupsLevel5<DB>,
      GroupsLevel6<DB>,
      GroupsLevel7<DB>,
      GroupsLevel8<DB>,
      GroupsLevel9<DB>,
      GroupsLevel10<DB>
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
          Schema extends Record<Key, infer Value extends Core.DocDef>
            ? Value
            : never
        >;
      }
    : never;

  export type GroupsLevel1<DB extends Core.DB<any>> =
    // Get the models for the given (0) level
    {
      [Name in Utils.UnionKeys<DB> as DB[Name] extends
        | Core.Collection<infer Def>
        | Core.NestedCollection<infer Def, any>
        ? Def["Name"] // Extract collection name from def
        : never]: DB[Name] extends
        | Core.Collection<infer Def>
        | Core.NestedCollection<infer Def, any>
        ? Def // Extract def
        : never;
    };

  export type GroupsLevel2<DB extends Core.DB<any>> =
    // Infer the nested (1) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedCollection<any, any>
        ? {
            [Name in Utils.UnionKeys<
              Collections["schema"]
            > as Collections["schema"][Name] extends
              | Core.Collection<infer Def>
              | Core.NestedCollection<infer Def, any>
              ? Def["Name"] // Extract collection name from def
              : never]: Collections["schema"][Name] extends
              | Core.Collection<infer Def>
              | Core.NestedCollection<infer Def, any>
              ? Def // Extract def
              : never;
          }
        : {}
      : {};

  export type GroupsLevel3<DB extends Core.DB<any>> =
    // Infer the nested (3) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedCollection<any, any>
        ? Collections["schema"] extends Record<any, infer Collections>
          ? Collections extends Core.NestedCollection<any, any>
            ? {
                [Name in Utils.UnionKeys<
                  Collections["schema"]
                > as Collections["schema"][Name] extends
                  | Core.Collection<infer Def>
                  | Core.NestedCollection<infer Def, any>
                  ? Def["Name"] // Extract collection name from def
                  : never]: Collections["schema"][Name] extends
                  | Core.Collection<infer Def>
                  | Core.NestedCollection<infer Def, any>
                  ? Def // Extract def
                  : never;
              }
            : {}
          : {}
        : {}
      : {};

  export type GroupsLevel4<DB extends Core.DB<any>> =
    // Infer the nested (4) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedCollection<any, any>
        ? Collections["schema"] extends Record<any, infer Collections>
          ? Collections extends Core.NestedCollection<any, any>
            ? Collections["schema"] extends Record<any, infer Collections>
              ? Collections extends Core.NestedCollection<any, any>
                ? {
                    [Name in Utils.UnionKeys<
                      Collections["schema"]
                    > as Collections["schema"][Name] extends
                      | Core.Collection<infer Def>
                      | Core.NestedCollection<infer Def, any>
                      ? Def["Name"] // Extract collection name from def
                      : never]: Collections["schema"][Name] extends
                      | Core.Collection<infer Def>
                      | Core.NestedCollection<infer Def, any>
                      ? Def // Extract def
                      : never;
                  }
                : {}
              : {}
            : {}
          : {}
        : {}
      : {};

  export type GroupsLevel5<DB extends Core.DB<any>> =
    // Infer the nested (5) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedCollection<any, any>
        ? Collections["schema"] extends Record<any, infer Collections>
          ? Collections extends Core.NestedCollection<any, any>
            ? Collections["schema"] extends Record<any, infer Collections>
              ? Collections extends Core.NestedCollection<any, any>
                ? Collections["schema"] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedCollection<any, any>
                    ? {
                        [Name in Utils.UnionKeys<
                          Collections["schema"]
                        > as Collections["schema"][Name] extends
                          | Core.Collection<infer Def>
                          | Core.NestedCollection<infer Def, any>
                          ? Def["Name"] // Extract collection name from def
                          : never]: Collections["schema"][Name] extends
                          | Core.Collection<infer Def>
                          | Core.NestedCollection<infer Def, any>
                          ? Def // Extract def
                          : never;
                      }
                    : {}
                  : {}
                : {}
              : {}
            : {}
          : {}
        : {}
      : {};

  export type GroupsLevel6<DB extends Core.DB<any>> =
    // Infer the nested (6) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedCollection<any, any>
        ? Collections["schema"] extends Record<any, infer Collections>
          ? Collections extends Core.NestedCollection<any, any>
            ? Collections["schema"] extends Record<any, infer Collections>
              ? Collections extends Core.NestedCollection<any, any>
                ? Collections["schema"] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedCollection<any, any>
                    ? Collections["schema"] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedCollection<any, any>
                        ? {
                            [Name in Utils.UnionKeys<
                              Collections["schema"]
                            > as Collections["schema"][Name] extends
                              | Core.Collection<infer Def>
                              | Core.NestedCollection<infer Def, any>
                              ? Def["Name"] // Extract collection name from def
                              : never]: Collections["schema"][Name] extends
                              | Core.Collection<infer Def>
                              | Core.NestedCollection<infer Def, any>
                              ? Def // Extract def
                              : never;
                          }
                        : {}
                      : {}
                    : {}
                  : {}
                : {}
              : {}
            : {}
          : {}
        : {}
      : {};

  export type GroupsLevel7<DB extends Core.DB<any>> =
    // Infer the nested (7) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedCollection<any, any>
        ? Collections["schema"] extends Record<any, infer Collections>
          ? Collections extends Core.NestedCollection<any, any>
            ? Collections["schema"] extends Record<any, infer Collections>
              ? Collections extends Core.NestedCollection<any, any>
                ? Collections["schema"] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedCollection<any, any>
                    ? Collections["schema"] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedCollection<any, any>
                        ? Collections["schema"] extends Record<
                            any,
                            infer Collections
                          >
                          ? Collections extends Core.NestedCollection<any, any>
                            ? {
                                [Name in Utils.UnionKeys<
                                  Collections["schema"]
                                > as Collections["schema"][Name] extends
                                  | Core.Collection<infer Def>
                                  | Core.NestedCollection<infer Def, any>
                                  ? Def["Name"] // Extract collection name from def
                                  : never]: Collections["schema"][Name] extends
                                  | Core.Collection<infer Def>
                                  | Core.NestedCollection<infer Def, any>
                                  ? Def // Extract def
                                  : never;
                              }
                            : {}
                          : {}
                        : {}
                      : {}
                    : {}
                  : {}
                : {}
              : {}
            : {}
          : {}
        : {}
      : {};

  export type GroupsLevel8<DB extends Core.DB<any>> =
    // Infer the nested (8) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedCollection<any, any>
        ? Collections["schema"] extends Record<any, infer Collections>
          ? Collections extends Core.NestedCollection<any, any>
            ? Collections["schema"] extends Record<any, infer Collections>
              ? Collections extends Core.NestedCollection<any, any>
                ? Collections["schema"] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedCollection<any, any>
                    ? Collections["schema"] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedCollection<any, any>
                        ? Collections["schema"] extends Record<
                            any,
                            infer Collections
                          >
                          ? Collections extends Core.NestedCollection<any, any>
                            ? Collections["schema"] extends Record<
                                any,
                                infer Collections
                              >
                              ? Collections extends Core.NestedCollection<
                                  any,
                                  any
                                >
                                ? {
                                    [Name in Utils.UnionKeys<
                                      Collections["schema"]
                                    > as Collections["schema"][Name] extends
                                      | Core.Collection<infer Def>
                                      | Core.NestedCollection<infer Def, any>
                                      ? Def["Name"] // Extract collection name from def
                                      : never]: Collections["schema"][Name] extends
                                      | Core.Collection<infer Def>
                                      | Core.NestedCollection<infer Def, any>
                                      ? Def // Extract def
                                      : never;
                                  }
                                : {}
                              : {}
                            : {}
                          : {}
                        : {}
                      : {}
                    : {}
                  : {}
                : {}
              : {}
            : {}
          : {}
        : {}
      : {};

  export type GroupsLevel9<DB extends Core.DB<any>> =
    // Infer the nested (9) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedCollection<any, any>
        ? Collections["schema"] extends Record<any, infer Collections>
          ? Collections extends Core.NestedCollection<any, any>
            ? Collections["schema"] extends Record<any, infer Collections>
              ? Collections extends Core.NestedCollection<any, any>
                ? Collections["schema"] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedCollection<any, any>
                    ? Collections["schema"] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedCollection<any, any>
                        ? Collections["schema"] extends Record<
                            any,
                            infer Collections
                          >
                          ? Collections extends Core.NestedCollection<any, any>
                            ? Collections["schema"] extends Record<
                                any,
                                infer Collections
                              >
                              ? Collections extends Core.NestedCollection<
                                  any,
                                  any
                                >
                                ? Collections["schema"] extends Record<
                                    any,
                                    infer Collections
                                  >
                                  ? Collections extends Core.NestedCollection<
                                      any,
                                      any
                                    >
                                    ? {
                                        [Name in Utils.UnionKeys<
                                          Collections["schema"]
                                        > as Collections["schema"][Name] extends
                                          | Core.Collection<infer Def>
                                          | Core.NestedCollection<
                                              infer Def,
                                              any
                                            >
                                          ? Def["Name"] // Extract collection name from def
                                          : never]: Collections["schema"][Name] extends
                                          | Core.Collection<infer Def>
                                          | Core.NestedCollection<
                                              infer Def,
                                              any
                                            >
                                          ? Def // Extract def
                                          : never;
                                      }
                                    : {}
                                  : {}
                                : {}
                              : {}
                            : {}
                          : {}
                        : {}
                      : {}
                    : {}
                  : {}
                : {}
              : {}
            : {}
          : {}
        : {}
      : {};

  export type GroupsLevel10<DB extends Core.DB<any>> =
    // Infer the nested (10) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedCollection<any, any>
        ? Collections["schema"] extends Record<any, infer Collections>
          ? Collections extends Core.NestedCollection<any, any>
            ? Collections["schema"] extends Record<any, infer Collections>
              ? Collections extends Core.NestedCollection<any, any>
                ? Collections["schema"] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedCollection<any, any>
                    ? Collections["schema"] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedCollection<any, any>
                        ? Collections["schema"] extends Record<
                            any,
                            infer Collections
                          >
                          ? Collections extends Core.NestedCollection<any, any>
                            ? Collections["schema"] extends Record<
                                any,
                                infer Collections
                              >
                              ? Collections extends Core.NestedCollection<
                                  any,
                                  any
                                >
                                ? Collections["schema"] extends Record<
                                    any,
                                    infer Collections
                                  >
                                  ? Collections extends Core.NestedCollection<
                                      any,
                                      any
                                    >
                                    ? Collections["schema"] extends Record<
                                        any,
                                        infer Collections
                                      >
                                      ? Collections extends Core.NestedCollection<
                                          any,
                                          any
                                        >
                                        ? {
                                            [Name in Utils.UnionKeys<
                                              Collections["schema"]
                                            > as Collections["schema"][Name] extends
                                              | Core.Collection<infer Def>
                                              | Core.NestedCollection<
                                                  infer Def,
                                                  any
                                                >
                                              ? Def["Name"] // Extract collection name from def
                                              : never]: Collections["schema"][Name] extends
                                              | Core.Collection<infer Def>
                                              | Core.NestedCollection<
                                                  infer Def,
                                                  any
                                                >
                                              ? Def // Extract def
                                              : never;
                                          }
                                        : {}
                                      : {}
                                    : {}
                                  : {}
                                : {}
                              : {}
                            : {}
                          : {}
                        : {}
                      : {}
                    : {}
                  : {}
                : {}
              : {}
            : {}
          : {}
        : {}
      : {};
}
