import type { Typesaurus } from '..'
import type { TypesaurusUtils } from '../utils'

export namespace TypesaurusGroups {
  export interface Function {
    <Schema extends Typesaurus.PlainSchema>(
      db: Typesaurus.DB<Schema>
    ): Groups<Schema>
  }

  export interface Group<Model, Path>
    extends Typesaurus.CollectionAPI<Model, Path> {
    /** The group type */
    type: 'group'

    /** The group name */
    name: string
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
      GroupsLevel3<Schema>
    > // TODO: Do we need more!?

  /**
   * The type merges extracted collections into groups.
   */
  export type ConstructGroups<Schema1, Schema2, Schema3> =
    | Schema1
    | Schema2
    | Schema3 extends infer Schema
    ? {
        [Key in TypesaurusUtils.UnionKeys<Schema>]: Group<
          Schema extends Record<Key, infer Value> ? Value : never
        >
      }
    : never

  /**
   * The type extracts schema models from a collections for {@link Groups}.
   */
  export type ExtractGroupModels<Schema> = {
    [Path in keyof Schema]: Schema[Path] extends
      | Typesaurus.PlainCollection<infer Model>
      | Typesaurus.NestedPlainCollection<infer Model, any>
      ? Model
      : never
  }

  export type GroupsLevel1<Schema> =
    // Get the models for the given (0) level
    ExtractGroupModels<Schema>

  export type GroupsLevel2<Schema> =
    // Infer the nested (1) schema
    Schema extends Record<any, infer Collections>
      ? Collections extends Typesaurus.NestedPlainCollection<any, any>
        ? {
            [Key in TypesaurusUtils.UnionKeys<
              Collections['schema']
            >]: Collections['schema'] extends Record<
              Key,
              | Typesaurus.PlainCollection<infer Model>
              | Typesaurus.NestedPlainCollection<infer Model, any>
            >
              ? Model
              : {}
          }
        : {}
      : {}

  export type GroupsLevel3<Schema> =
    // Infer the nested (2) schema
    Schema extends Record<any, infer Collections>
      ? Collections extends Typesaurus.NestedPlainCollection<any, any>
        ? Collections['schema'] extends Record<any, infer Collections>
          ? Collections extends Typesaurus.NestedPlainCollection<any, any>
            ? {
                [Key in TypesaurusUtils.UnionKeys<
                  Collections['schema']
                >]: Collections['schema'] extends Record<
                  Key,
                  Typesaurus.PlainCollection<infer Model>
                >
                  ? Model
                  : {}
              }
            : {}
          : {}
        : {}
      : {}
}
