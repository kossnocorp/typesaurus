import type { TypesaurusUtils } from '../utils'
import type { Typesaurus } from './core'

export namespace TypesaurusQuery {
  export type DocId = '__id__'

  export type OrderDirection = 'desc' | 'asc'

  export type WhereFilter =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'in'
    | 'not-in'
    | 'array-contains'
    | 'array-contains-any'

  /**
   * The query type.
   */
  export type Query<Model> =
    | OrderQuery<Model>
    | WhereQuery<Model>
    | LimitQuery<Model>

  /**
   * The order query type. Used to build query.
   */
  export interface OrderQuery<_Model> {
    type: 'order'
    field: string[]
    method: OrderDirection
    cursors: OrderCursors<Typesaurus.ModelPathPair, any, any>
  }

  export interface WhereQuery<_Model> {
    type: 'where'
    field: string[] | [DocId]
    filter: WhereFilter
    value: any
  }

  /**
   * The limit query type. It contains the limit value.
   */
  export interface LimitQuery<_Model> {
    type: 'limit'
    number: number
  }

  export type OrderCursors<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | [OrderCursorStart<ModelPair, Parent, Key>]
    | [OrderCursorEnd<ModelPair, Parent, Key>]
    | [
        OrderCursorStart<ModelPair, Parent, Key>,
        OrderCursorEnd<ModelPair, Parent, Key>
      ]

  export type OrderCursorPosition =
    | 'startAt'
    | 'startAfter'
    | 'endBefore'
    | 'endAt'

  export type OrderCursorStart<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | OrderCursorStartAt<ModelPair, Parent, Key>
    | OrderCursorStartAfter<ModelPair, Parent, Key>

  export interface OrderCursorStartAt<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<ModelPair, Parent, Key, 'startAt'> {}

  export interface OrderCursorStartAfter<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<ModelPair, Parent, Key, 'startAfter'> {}

  export type OrderCursorEnd<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | OrderCursorEndAt<ModelPair, Parent, Key>
    | OrderCursorEndBefore<ModelPair, Parent, Key>

  export interface OrderCursorEndAt<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<ModelPair, Parent, Key, 'endAt'> {}

  export interface OrderCursorEndBefore<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<ModelPair, Parent, Key, 'endBefore'> {}

  export interface OrderCursor<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId,
    Position extends OrderCursorPosition
  > {
    type: 'cursor'
    position: Position
    value: OrderCursorValue<ModelPair, Parent, Key>
  }

  export type OrderCursorValue<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | (Key extends keyof Parent ? Parent[Key] : ModelPair[1]) /* Id */ // Field value or id
    | Typesaurus.Doc<ModelPair> // Will be used to get value for the cursor
    | undefined // Indicates the start of the query

  export type QueryGetter<ModelPair extends Typesaurus.ModelPathPair> = (
    $: QueryHelpers<ModelPair[0], ModelPair[1]>
  ) => Query<ModelPair[0] /* Model */> | Query<ModelPair[0] /* Model */>[]

  export interface QueryFieldBase<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent | DocId
  > {
    // With cursors
    order(
      ...cursors: OrderCursors<ModelPair, Parent, Key> | []
    ): OrderQuery<ModelPair[0] /* Model */>

    // With method and cursors
    order(
      method: OrderDirection,
      ...cursors: OrderCursors<ModelPair, Parent, Key> | []
    ): OrderQuery<ModelPair[0] /* Model */>
  }

  export interface QueryIdField<ModelPair extends Typesaurus.ModelPathPair>
    extends QueryFieldBase<ModelPair, ModelPair[0] /* Model */, DocId> {
    less(id: ModelPair[1] /* Id */): WhereQuery<ModelPair[0] /* Model */>

    lessOrEqual(id: ModelPair[1] /* Id */): WhereQuery<ModelPair[0] /* Model */>

    equal(id: ModelPair[1] /* Id */): WhereQuery<ModelPair[0] /* Model */>

    not(id: ModelPair[1] /* Id */): WhereQuery<ModelPair[0] /* Model */>

    more(id: ModelPair[1] /* Id */): WhereQuery<ModelPair[0] /* Model */>

    moreOrEqual(id: ModelPair[1] /* Id */): WhereQuery<ModelPair[0] /* Model */>

    in(ids: ModelPair[1] /* Id */[]): WhereQuery<ModelPair[0] /* Model */>

    notIn(ids: ModelPair[1] /* Id */[]): WhereQuery<ModelPair[0] /* Model */>
  }

  export interface QueryPrimitiveField<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent
  > extends QueryFieldBase<ModelPair, Parent, Key> {
    less(field: Parent[Key]): WhereQuery<ModelPair[0] /* Model */>

    lessOrEqual(field: Parent[Key]): WhereQuery<ModelPair[0] /* Model */>

    equal(field: Parent[Key]): WhereQuery<ModelPair[0] /* Model */>

    not(field: Parent[Key]): WhereQuery<ModelPair[0] /* Model */>

    more(field: Parent[Key]): WhereQuery<ModelPair[0] /* Model */>

    moreOrEqual(field: Parent[Key]): WhereQuery<ModelPair[0] /* Model */>

    in(fields: Parent[Key][]): WhereQuery<ModelPair[0] /* Model */>

    notIn(fields: Parent[Key][]): WhereQuery<ModelPair[0] /* Model */>
  }

  export interface QueryArrayField<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent
  > {
    contains(
      field: Exclude<Parent[Key], undefined> extends Array<infer ItemType>
        ? ItemType
        : never
    ): WhereQuery<ModelPair[0] /* Model */>

    containsAny(
      field: Exclude<Parent[Key], undefined> extends Array<any>
        ? Parent[Key]
        : never
    ): WhereQuery<ModelPair[0] /* Model */>
  }

  export type QueryField<
    ModelPair extends Typesaurus.ModelPathPair,
    Parent,
    Key extends keyof Parent
  > = Exclude<Parent[Key], undefined> extends Array<any>
    ? QueryArrayField<ModelPair, Parent, Key>
    : QueryPrimitiveField<ModelPair, Parent, Key>

  export interface QueryHelpers<
    Model extends Typesaurus.ModelType,
    Id extends Typesaurus.Id<any>
  > {
    field(id: DocId): QueryIdField<[Model, Id]>

    field<Key extends keyof Model>(
      key: Key
    ): QueryField<[Model, Id], Model, Key>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      key1: Key1,
      key2: Key2
    ): QueryField<[Model, Id], TypesaurusUtils.AllRequired<Model>[Key1], Key2>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3
    ): QueryField<
      [Model, Id],
      TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2],
      Key3
    >

    limit(to: number): LimitQuery<Model>

    startAt<Parent, Key extends keyof Parent | DocId>(
      value: OrderCursorValue<[Model, Id], Parent, Key>
    ): OrderCursorStartAt<[Model, Id], Parent, Key>

    startAfter<Parent, Key extends keyof Parent | DocId>(
      value: OrderCursorValue<[Model, Id], Parent, Key>
    ): OrderCursorStartAfter<[Model, Id], Parent, Key>

    endAt<Parent, Key extends keyof Parent | DocId>(
      value: OrderCursorValue<[Model, Id], Parent, Key>
    ): OrderCursorEndAt<[Model, Id], Parent, Key>

    endBefore<Parent, Key extends keyof Parent | DocId>(
      value: OrderCursorValue<[Model, Id], Parent, Key>
    ): OrderCursorEndBefore<[Model, Id], Parent, Key>

    docId(): DocId
  }
}
