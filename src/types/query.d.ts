import type { TypesaurusUtils as Utils } from './utils'
import type { TypesaurusCore as Core } from './core'

export namespace TypesaurusQuery {
  export interface Function<ModelPair extends Core.ModelIdPair> {
    <
      Source extends Core.DataSource,
      DateStrategy extends Core.ServerDateStrategy,
      Environment extends Core.RuntimeEnvironment
    >(
      queries: TypesaurusQuery.QueryGetter<ModelPair>,
      options?: Core.ReadOptions<DateStrategy, Environment>
    ): Core.SubscriptionPromise<
      Core.QueryRequest,
      Core.EnvironmentDoc<ModelPair, Source, DateStrategy, Environment>[],
      Core.SubscriptionListMeta<ModelPair, Source, DateStrategy, Environment>
    >

    build<
      Source extends Core.DataSource,
      DateStrategy extends Core.ServerDateStrategy,
      Environment extends Core.RuntimeEnvironment
    >(
      options?: Core.ReadOptions<DateStrategy, Environment>
    ): QueryBuilder<ModelPair, Source, DateStrategy, Environment>
  }

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
    cursors: OrderCursors<Core.ModelIdPair, any, any>
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
    ModelPair extends Core.ModelIdPair,
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
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | OrderCursorStartAt<ModelPair, Parent, Key>
    | OrderCursorStartAfter<ModelPair, Parent, Key>

  export interface OrderCursorStartAt<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<ModelPair, Parent, Key, 'startAt'> {}

  export interface OrderCursorStartAfter<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<ModelPair, Parent, Key, 'startAfter'> {}

  export type OrderCursorEnd<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | OrderCursorEndAt<ModelPair, Parent, Key>
    | OrderCursorEndBefore<ModelPair, Parent, Key>

  export interface OrderCursorEndAt<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<ModelPair, Parent, Key, 'endAt'> {}

  export interface OrderCursorEndBefore<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<ModelPair, Parent, Key, 'endBefore'> {}

  export interface OrderCursor<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent | DocId,
    Position extends OrderCursorPosition
  > {
    type: 'cursor'
    position: Position
    value: OrderCursorValue<ModelPair, Parent, Key>
  }

  export type OrderCursorValue<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | (Key extends keyof Parent ? Parent[Key] : ModelPair[1]) /* Id */ // Field value or id
    | Core.Doc<ModelPair> // Will be used to get value for the cursor
    | undefined // Indicates the start of the query

  export type QueryGetter<ModelPair extends Core.ModelIdPair> = (
    $: QueryHelpers<ModelPair[0], ModelPair[1]>
  ) => Query<ModelPair[0] /* Model */> | Query<ModelPair[0] /* Model */>[]

  export interface QueryFieldBase<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent | DocId,
    OrderQueryResult
  > {
    // With cursors
    order(
      ...cursors: OrderCursors<ModelPair, Parent, Key> | []
    ): OrderQueryResult

    // With method and cursors
    order(
      method: OrderDirection,
      ...cursors: OrderCursors<ModelPair, Parent, Key> | []
    ): OrderQueryResult
  }

  export interface QueryIdField<
    ModelPair extends Core.ModelIdPair,
    OrderQueryResult,
    WhereQueryResult
  > extends QueryFieldBase<
      ModelPair,
      ModelPair[0] /* Model */,
      DocId,
      OrderQueryResult
    > {
    less(id: ModelPair[1] /* Id */): WhereQueryResult

    lessOrEqual(id: ModelPair[1] /* Id */): WhereQueryResult

    equal(id: ModelPair[1] /* Id */): WhereQueryResult

    not(id: ModelPair[1] /* Id */): WhereQueryResult

    more(id: ModelPair[1] /* Id */): WhereQueryResult

    moreOrEqual(id: ModelPair[1] /* Id */): WhereQueryResult

    in(ids: ModelPair[1] /* Id */[]): WhereQueryResult

    notIn(ids: ModelPair[1] /* Id */[]): WhereQueryResult
  }

  export interface QueryPrimitiveField<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent,
    OrderQueryResult,
    WhereQueryResult
  > extends QueryFieldBase<ModelPair, Parent, Key, OrderQueryResult> {
    less(field: Parent[Key]): WhereQueryResult

    lessOrEqual(field: Parent[Key]): WhereQueryResult

    equal(field: Parent[Key]): WhereQueryResult

    not(field: Parent[Key]): WhereQueryResult

    more(field: Parent[Key]): WhereQueryResult

    moreOrEqual(field: Parent[Key]): WhereQueryResult

    in(fields: Parent[Key][]): WhereQueryResult

    notIn(fields: Parent[Key][]): WhereQueryResult
  }

  export interface QueryArrayField<
    Parent,
    Key extends keyof Parent,
    WhereQueryResult
  > {
    contains(
      field: Exclude<Parent[Key], undefined> extends Array<infer ItemType>
        ? ItemType
        : never
    ): WhereQueryResult

    containsAny(
      field: Exclude<Parent[Key], undefined> extends Array<any>
        ? Parent[Key]
        : never
    ): WhereQueryResult
  }

  export type QueryField<
    ModelPair extends Core.ModelIdPair,
    Parent,
    Key extends keyof Parent,
    OrderQueryResult,
    WhereQueryResult
  > = Exclude<Parent[Key], undefined> extends Array<any>
    ? QueryArrayField<Parent, Key, WhereQueryResult>
    : QueryPrimitiveField<
        ModelPair,
        Parent,
        Key,
        OrderQueryResult,
        WhereQueryResult
      >

  /**
   * Common query helpers API with query object result passed as a generic.
   * @internal.
   */
  export interface CommonQueryHelpers<
    Model extends Core.ModelType,
    Id extends Core.Id<any>,
    OrderQueryResult,
    WhereQueryResult,
    LimitQueryResult
  > {
    field(
      id: DocId
    ): QueryIdField<[Model, Id], OrderQueryResult, LimitQueryResult>

    field<Key extends keyof Model>(
      key: Key
    ): QueryField<[Model, Id], Model, Key, OrderQueryResult, WhereQueryResult>

    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1]
    >(
      key1: Key1,
      key2: Key2
    ): QueryField<
      [Model, Id],
      Utils.AllRequired<Model>[Key1],
      Key2,
      OrderQueryResult,
      WhereQueryResult
    >

    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3
    ): QueryField<
      [Model, Id],
      Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2],
      Key3,
      OrderQueryResult,
      WhereQueryResult
    >

    limit(to: number): LimitQueryResult

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

  /**
   * Query helpers object avaliable in the `query` function.
   */
  export interface QueryHelpers<
    Model extends Core.ModelType,
    Id extends Core.Id<any>
  > extends CommonQueryHelpers<
      Model,
      Id,
      OrderQuery<Model>,
      WhereQuery<Model>,
      LimitQuery<Model>
    > {}

  /**
   * Query builder works like regular query helpers, but the run can be delayed
   * and mixed with other code.
   */
  export interface QueryBuilder<
    ModelPair extends Core.ModelIdPair,
    Source extends Core.DataSource,
    DateStrategy extends Core.ServerDateStrategy,
    Environment extends Core.RuntimeEnvironment
  > extends CommonQueryHelpers<
      ModelPair[0] /* Model */,
      ModelPair[1] /* Path */,
      void,
      void,
      void
    > {
    /**
     * Runs the built query.
     */
    run(): Core.SubscriptionPromise<
      Core.QueryRequest,
      Core.EnvironmentDoc<ModelPair, Source, DateStrategy, Environment>[],
      Core.SubscriptionListMeta<ModelPair, Source, DateStrategy, Environment>
    >
  }
}
