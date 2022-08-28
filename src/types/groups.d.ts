import type { TypesaurusCore as Core } from './core'
import type { TypesaurusUtils as Utils } from './utils'

export namespace TypesaurusGroups {
  export interface Function {
    <DB extends Core.DB<any>>(db: DB): Groups<DB>
  }

  export interface Group<ModelPair extends Core.ModelIdPair>
    extends Core.CollectionAPI<ModelPair> {
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
    ConstructGroups<GroupsLevel1<DB>, GroupsLevel2<DB>, GroupsLevel3<DB>> // TODO: Do we need more!?

  /**
   * The type merges extracted collections into groups.
   */
  export type ConstructGroups<Schema1, Schema2, Schema3> =
    | Schema1
    | Schema2
    | Schema3 extends infer Schema
    ? {
        [Key in Utils.UnionKeys<Schema>]: Group<
          Schema extends Record<Key, infer Value>
            ? Value extends Core.ModelIdPair
              ? Value
              : never
            : never
        >
      }
    : never

  /**
   * The type extracts schema models from a collections for {@link Groups}.
   */
  export type ExtractGroupModels<DB extends Core.DB<any>> = {
    [Path in keyof DB]: DB[Path] extends
      | Core.RichCollection<infer ModelPair>
      | Core.NestedRichCollection<infer ModelPair, any>
      ? ModelPair
      : never
  }

  export type GroupsLevel1<DB extends Core.DB<any>> =
    // Get the models for the given (0) level
    ExtractGroupModels<DB>

  export type GroupsLevel2<DB extends Core.DB<any>> =
    // Infer the nested (1) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedPlainCollection<any, any>
        ? {
            [Key in Utils.UnionKeys<
              Collections['schema']
            >]: Collections['schema'] extends Record<
              Key,
              | Core.RichCollection<infer ModelPair>
              | Core.NestedRichCollection<infer ModelPair, any>
            >
              ? ModelPair
              : {}
          }
        : {}
      : {}

  export type GroupsLevel3<DB extends Core.DB<any>> =
    // Infer the nested (2) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Core.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Core.NestedRichCollection<any, any>
            ? {
                [Key in Utils.UnionKeys<
                  Collections['schema']
                >]: Collections['schema'] extends Record<
                  Key,
                  Core.RichCollection<infer ModelPair>
                >
                  ? ModelPair
                  : {}
              }
            : {}
          : {}
        : {}
      : {}
}
