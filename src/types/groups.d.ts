import type { TypesaurusCore as Core } from './core'
import type { TypesaurusUtils as Utils } from './utils'

export namespace TypesaurusGroups {
  export interface Function {
    <DB extends Core.DB<any>>(db: DB): Groups<DB>
  }

  export interface Group<Def extends Core.DocDef>
    extends Core.CollectionAPI<Def> {
    /** The group type */
    type: 'group'

    /** The group name */
    name: string
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
    >

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
    Schema10
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
        >
      }
    : never

  /**
   * The type extracts schema models from a collections for {@link Groups}.
   */
  export type ExtractGroupModels<DB extends Core.DB<any>> = {
    [Path in keyof DB]: DB[Path] extends
      | Core.RichCollection<infer Def>
      | Core.NestedRichCollection<infer Def, any>
      ? Def
      : never
  }

  export type GroupsLevel1<DB extends Core.DB<any>> =
    // Get the models for the given (0) level
    ExtractGroupModels<DB>

  export type GroupsLevel2<DB extends Core.DB<any>> =
    // Infer the nested (1) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? {
            [Key in Utils.UnionKeys<
              Collections['schema']
            >]: Collections['schema'] extends Record<
              Key,
              | Core.RichCollection<infer Def>
              | Core.NestedRichCollection<infer Def, any>
            >
              ? Def
              : {}
          }
        : {}
      : {}

  export type GroupsLevel3<DB extends Core.DB<any>> =
    // Infer the nested (3) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Core.NestedRichCollection<any, any>
            ? {
                [Key in Utils.UnionKeys<
                  Collections['schema']
                >]: Collections['schema'] extends Record<
                  Key,
                  | Core.RichCollection<infer Def>
                  | Core.NestedRichCollection<infer Def, any>
                >
                  ? Def
                  : {}
              }
            : {}
          : {}
        : {}
      : {}

  export type GroupsLevel4<DB extends Core.DB<any>> =
    // Infer the nested (4) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Core.NestedRichCollection<any, any>
            ? Collections['schema'] extends Record<any, infer Collections>
              ? Collections extends Core.NestedRichCollection<any, any>
                ? {
                    [Key in Utils.UnionKeys<
                      Collections['schema']
                    >]: Collections['schema'] extends Record<
                      Key,
                      | Core.RichCollection<infer Def>
                      | Core.NestedRichCollection<infer Def, any>
                    >
                      ? Def
                      : {}
                  }
                : {}
              : {}
            : {}
          : {}
        : {}
      : {}

  export type GroupsLevel5<DB extends Core.DB<any>> =
    // Infer the nested (5) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Core.NestedRichCollection<any, any>
            ? Collections['schema'] extends Record<any, infer Collections>
              ? Collections extends Core.NestedRichCollection<any, any>
                ? Collections['schema'] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedRichCollection<any, any>
                    ? {
                        [Key in Utils.UnionKeys<
                          Collections['schema']
                        >]: Collections['schema'] extends Record<
                          Key,
                          | Core.RichCollection<infer Def>
                          | Core.NestedRichCollection<infer Def, any>
                        >
                          ? Def
                          : {}
                      }
                    : {}
                  : {}
                : {}
              : {}
            : {}
          : {}
        : {}
      : {}

  export type GroupsLevel6<DB extends Core.DB<any>> =
    // Infer the nested (6) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Core.NestedRichCollection<any, any>
            ? Collections['schema'] extends Record<any, infer Collections>
              ? Collections extends Core.NestedRichCollection<any, any>
                ? Collections['schema'] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedRichCollection<any, any>
                    ? Collections['schema'] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedRichCollection<any, any>
                        ? {
                            [Key in Utils.UnionKeys<
                              Collections['schema']
                            >]: Collections['schema'] extends Record<
                              Key,
                              | Core.RichCollection<infer Def>
                              | Core.NestedRichCollection<infer Def, any>
                            >
                              ? Def
                              : {}
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

  export type GroupsLevel7<DB extends Core.DB<any>> =
    // Infer the nested (7) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Core.NestedRichCollection<any, any>
            ? Collections['schema'] extends Record<any, infer Collections>
              ? Collections extends Core.NestedRichCollection<any, any>
                ? Collections['schema'] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedRichCollection<any, any>
                    ? Collections['schema'] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedRichCollection<any, any>
                        ? Collections['schema'] extends Record<
                            any,
                            infer Collections
                          >
                          ? Collections extends Core.NestedRichCollection<
                              any,
                              any
                            >
                            ? {
                                [Key in Utils.UnionKeys<
                                  Collections['schema']
                                >]: Collections['schema'] extends Record<
                                  Key,
                                  | Core.RichCollection<infer Def>
                                  | Core.NestedRichCollection<infer Def, any>
                                >
                                  ? Def
                                  : {}
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

  export type GroupsLevel8<DB extends Core.DB<any>> =
    // Infer the nested (8) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Core.NestedRichCollection<any, any>
            ? Collections['schema'] extends Record<any, infer Collections>
              ? Collections extends Core.NestedRichCollection<any, any>
                ? Collections['schema'] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedRichCollection<any, any>
                    ? Collections['schema'] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedRichCollection<any, any>
                        ? Collections['schema'] extends Record<
                            any,
                            infer Collections
                          >
                          ? Collections extends Core.NestedRichCollection<
                              any,
                              any
                            >
                            ? Collections['schema'] extends Record<
                                any,
                                infer Collections
                              >
                              ? Collections extends Core.NestedRichCollection<
                                  any,
                                  any
                                >
                                ? {
                                    [Key in Utils.UnionKeys<
                                      Collections['schema']
                                    >]: Collections['schema'] extends Record<
                                      Key,
                                      | Core.RichCollection<infer Def>
                                      | Core.NestedRichCollection<
                                          infer Def,
                                          any
                                        >
                                    >
                                      ? Def
                                      : {}
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

  export type GroupsLevel9<DB extends Core.DB<any>> =
    // Infer the nested (9) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Core.NestedRichCollection<any, any>
            ? Collections['schema'] extends Record<any, infer Collections>
              ? Collections extends Core.NestedRichCollection<any, any>
                ? Collections['schema'] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedRichCollection<any, any>
                    ? Collections['schema'] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedRichCollection<any, any>
                        ? Collections['schema'] extends Record<
                            any,
                            infer Collections
                          >
                          ? Collections extends Core.NestedRichCollection<
                              any,
                              any
                            >
                            ? Collections['schema'] extends Record<
                                any,
                                infer Collections
                              >
                              ? Collections extends Core.NestedRichCollection<
                                  any,
                                  any
                                >
                                ? Collections['schema'] extends Record<
                                    any,
                                    infer Collections
                                  >
                                  ? Collections extends Core.NestedRichCollection<
                                      any,
                                      any
                                    >
                                    ? {
                                        [Key in Utils.UnionKeys<
                                          Collections['schema']
                                        >]: Collections['schema'] extends Record<
                                          Key,
                                          | Core.RichCollection<infer Def>
                                          | Core.NestedRichCollection<
                                              infer Def,
                                              any
                                            >
                                        >
                                          ? Def
                                          : {}
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

  export type GroupsLevel10<DB extends Core.DB<any>> =
    // Infer the nested (10) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Core.NestedRichCollection<any, any>
            ? Collections['schema'] extends Record<any, infer Collections>
              ? Collections extends Core.NestedRichCollection<any, any>
                ? Collections['schema'] extends Record<any, infer Collections>
                  ? Collections extends Core.NestedRichCollection<any, any>
                    ? Collections['schema'] extends Record<
                        any,
                        infer Collections
                      >
                      ? Collections extends Core.NestedRichCollection<any, any>
                        ? Collections['schema'] extends Record<
                            any,
                            infer Collections
                          >
                          ? Collections extends Core.NestedRichCollection<
                              any,
                              any
                            >
                            ? Collections['schema'] extends Record<
                                any,
                                infer Collections
                              >
                              ? Collections extends Core.NestedRichCollection<
                                  any,
                                  any
                                >
                                ? Collections['schema'] extends Record<
                                    any,
                                    infer Collections
                                  >
                                  ? Collections extends Core.NestedRichCollection<
                                      any,
                                      any
                                    >
                                    ? Collections['schema'] extends Record<
                                        any,
                                        infer Collections
                                      >
                                      ? Collections extends Core.NestedRichCollection<
                                          any,
                                          any
                                        >
                                        ? {
                                            [Key in Utils.UnionKeys<
                                              Collections['schema']
                                            >]: Collections['schema'] extends Record<
                                              Key,
                                              | Core.RichCollection<infer Def>
                                              | Core.NestedRichCollection<
                                                  infer Def,
                                                  any
                                                >
                                            >
                                              ? Def
                                              : {}
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
      : {}
}
