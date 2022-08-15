import type { Typesaurus } from '..'
import type { TypesaurusUtils } from '../utils'

export namespace TypesaurusGroups {
  export interface Function {
    <DB extends Typesaurus.DB<any>>(db: DB): Groups<DB>
  }

  export interface Group<ModelPair extends Typesaurus.ModelIdPair>
    extends Typesaurus.CollectionAPI<ModelPair> {
    /** The group type */
    type: 'group'

    /** The group name */
    name: string
  }

  /**
   * The type flattens the schema and generates groups from nested and
   * root collections.
   */
  export type Groups<DB extends Typesaurus.DB<any>> =
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
        [Key in TypesaurusUtils.UnionKeys<Schema>]: Group<
          Schema extends Record<Key, infer Value>
            ? Value extends Typesaurus.ModelIdPair
              ? Value
              : never
            : never
        >
      }
    : never

  /**
   * The type extracts schema models from a collections for {@link Groups}.
   */
  export type ExtractGroupModels<DB extends Typesaurus.DB<any>> = {
    [Path in keyof DB]: DB[Path] extends
      | Typesaurus.RichCollection<infer ModelPair>
      | Typesaurus.NestedRichCollection<infer ModelPair, any>
      ? ModelPair
      : never
  }

  export type GroupsLevel1<DB extends Typesaurus.DB<any>> =
    // Get the models for the given (0) level
    ExtractGroupModels<DB>

  export type GroupsLevel2<DB extends Typesaurus.DB<any>> =
    // Infer the nested (1) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Typesaurus.NestedPlainCollection<any, any>
        ? {
            [Key in TypesaurusUtils.UnionKeys<
              Collections['schema']
            >]: Collections['schema'] extends Record<
              Key,
              | Typesaurus.RichCollection<infer ModelPair>
              | Typesaurus.NestedRichCollection<infer ModelPair, any>
            >
              ? ModelPair
              : {}
          }
        : {}
      : {}

  export type GroupsLevel3<DB extends Typesaurus.DB<any>> =
    // Infer the nested (2) schema
    DB extends Record<any, infer Collections>
      ? Collections extends Typesaurus.NestedRichCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Typesaurus.NestedRichCollection<any, any>
            ? {
                [Key in TypesaurusUtils.UnionKeys<
                  Collections['schema']
                >]: Collections['schema'] extends Record<
                  Key,
                  Typesaurus.RichCollection<infer ModelPair>
                >
                  ? ModelPair
                  : {}
              }
            : {}
          : {}
        : {}
      : {}
}
