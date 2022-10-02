import type { TypesaurusUtils as Utils } from './utils'
import type { TypesaurusCore as Core } from './core'

export namespace TypesaurusQuery {
  export interface Function<Def extends Core.DocDef> {
    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
      Getter extends TypesaurusQuery.QueryGetter<Def>
    >(
      queries: Getter,
      options?: Core.ReadOptions<Environment, Props>
    ): Getter extends ($: Helpers<Def>) => infer Result
      ? Result extends Utils.Falsy
        ? // Enable empty query to signal that the query is not ready. It allows
          // wrappers like Typesaurus React to know that it's not ready
          // to perform, e.g., when a dependency fetch is in progress or
          // the user is not authenticated. Since it's a function,
          // it's impossible towrap the query into a check because the check
          // will be invalid inside the function.
          undefined
        : Core.SubscriptionPromise<
            Core.QueryRequest,
            Core.Doc<Def, Props>[],
            Core.SubscriptionListMeta<Def, Props>
          >
      : never

    build<
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment }
    >(
      options?: Core.ReadOptions<Environment, Props>
    ): Builder<Def, Props>
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
    cursors: OrderCursors<Core.DocDef, any, any>
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
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | OrderCursorsEmpty // Enable conditional cursors
    | OrderCursorStart<Def, Parent, Key>
    | [OrderCursorStart<Def, Parent, Key>]
    | OrderCursorEnd<Def, Parent, Key>
    | [OrderCursorEnd<Def, Parent, Key>]
    | [OrderCursorStart<Def, Parent, Key>, OrderCursorEnd<Def, Parent, Key>]

  export type OrderCursorsEmpty = undefined | null | '' | false | []

  export type OrderCursorPosition =
    | 'startAt'
    | 'startAfter'
    | 'endBefore'
    | 'endAt'

  export type OrderCursorStart<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | OrderCursorStartAt<Def, Parent, Key>
    | OrderCursorStartAfter<Def, Parent, Key>

  export interface OrderCursorStartAt<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<Def, Parent, Key, 'startAt'> {}

  export interface OrderCursorStartAfter<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<Def, Parent, Key, 'startAfter'> {}

  export type OrderCursorEnd<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | OrderCursorEndAt<Def, Parent, Key>
    | OrderCursorEndBefore<Def, Parent, Key>

  export interface OrderCursorEndAt<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<Def, Parent, Key, 'endAt'> {}

  export interface OrderCursorEndBefore<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId
  > extends OrderCursor<Def, Parent, Key, 'endBefore'> {}

  export interface OrderCursor<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId,
    Position extends OrderCursorPosition
  > {
    type: 'cursor'
    position: Position
    value: OrderCursorValue<Def, Parent, Key>
  }

  export type OrderCursorValue<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId
  > =
    | (Key extends keyof Parent ? QueryFieldValue<Parent[Key]> : Def['Id']) // Field value or id
    | Core.Doc<Def, Core.DocProps> // Will be used to get value for the cursor
    | undefined // Indicates the start of the query

  export type QueryGetter<Def extends Core.DocDef> = (
    $: Helpers<Def>
  ) =>
    | Query<Def['Model']>
    | Array<Query<Def['Model']> | Utils.Falsy>
    | Utils.Falsy

  export interface QueryFieldBase<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent | DocId,
    OrderQueryResult
  > {
    // With cursors
    order(cursors?: OrderCursors<Def, Parent, Key> | []): OrderQueryResult

    // With method and cursors
    order(
      method: OrderDirection,
      cursors?: OrderCursors<Def, Parent, Key> | []
    ): OrderQueryResult
  }

  export interface QueryIdField<
    Def extends Core.DocDef,
    OrderQueryResult,
    WhereQueryResult
  > extends QueryFieldBase<Def, Def['Model'], DocId, OrderQueryResult> {
    less(id: Def['Id']): WhereQueryResult

    lessOrEqual(id: Def['Id']): WhereQueryResult

    equal(id: Def['Id']): WhereQueryResult

    not(id: Def['Id']): WhereQueryResult

    more(id: Def['Id']): WhereQueryResult

    moreOrEqual(id: Def['Id']): WhereQueryResult

    in(ids: Def['Id'][]): WhereQueryResult

    notIn(ids: Def['Id'][]): WhereQueryResult
  }

  export interface QueryPrimitiveField<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent,
    OrderQueryResult,
    WhereQueryResult
  > extends QueryFieldBase<Def, Parent, Key, OrderQueryResult> {
    less(field: QueryFieldValue<Parent[Key]>): WhereQueryResult

    lessOrEqual(field: QueryFieldValue<Parent[Key]>): WhereQueryResult

    equal(field: QueryFieldValue<Parent[Key]>): WhereQueryResult

    not(field: QueryFieldValue<Parent[Key]>): WhereQueryResult

    more(field: QueryFieldValue<Parent[Key]>): WhereQueryResult

    moreOrEqual(field: QueryFieldValue<Parent[Key]>): WhereQueryResult

    in(fields: QueryFieldValue<Parent[Key]>[]): WhereQueryResult

    notIn(fields: QueryFieldValue<Parent[Key]>[]): WhereQueryResult
  }

  export interface QueryArrayField<
    Parent,
    Key extends keyof Parent,
    WhereQueryResult
  > {
    contains(
      field: Exclude<Parent[Key], undefined> extends Array<infer ItemType>
        ? QueryFieldValue<ItemType>
        : never
    ): WhereQueryResult

    containsAny(
      field: Exclude<Parent[Key], undefined> extends Array<any>
        ? QueryFieldValue<Parent[Key]>
        : never
    ): WhereQueryResult
  }

  export type QueryField<
    Def extends Core.DocDef,
    Parent,
    Key extends keyof Parent,
    OrderQueryResult,
    WhereQueryResult
  > = Exclude<Parent[Key], undefined> extends Array<any>
    ? QueryArrayField<Parent, Key, WhereQueryResult>
    : QueryPrimitiveField<Def, Parent, Key, OrderQueryResult, WhereQueryResult>

  export type QueryFieldValue<Value> = Exclude<
    Value,
    undefined
  > extends Core.ServerDate
    ? Exclude<Value, Core.ServerDate> | Date
    : Value

  /**
   * Common query helpers API with query object result passed as a generic.
   */
  export interface CommonQueryHelpers<
    Def extends Core.DocDef,
    Model extends Core.ModelObjectType,
    OrderQueryResult,
    WhereQueryResult,
    LimitQueryResult
  > {
    /**
     * Id selector, allows querying by the document id.
     */
    field(id: DocId): QueryIdField<Def, OrderQueryResult, LimitQueryResult>

    /**
     * Field selector, allows querying by a specific field.
     */
    field<Key extends keyof Model>(
      key: Key
    ): QueryField<Def, Model, Key, OrderQueryResult, WhereQueryResult>

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1]
    >(
      key1: Key1,
      key2: Key2
    ): QueryField<
      Def,
      Utils.AllRequired<Model>[Key1],
      Key2,
      OrderQueryResult,
      WhereQueryResult
    >

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3
    ): QueryField<
      Def,
      Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2],
      Key3,
      OrderQueryResult,
      WhereQueryResult
    >

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4
    ): QueryField<
      Def,
      Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key4,
      OrderQueryResult,
      WhereQueryResult
    >

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5
    ): QueryField<
      Def,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key5,
      OrderQueryResult,
      WhereQueryResult
    >

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5,
      key6: Key6
    ): QueryField<
      Def,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key6,
      OrderQueryResult,
      WhereQueryResult
    >

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key7 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5,
      key6: Key6,
      key7: Key7
    ): QueryField<
      Def,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6],
      Key7,
      OrderQueryResult,
      WhereQueryResult
    >

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key7 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6],
      Key8 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5,
      key6: Key6,
      key7: Key7,
      key8: Key8
    ): QueryField<
      Def,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7],
      Key8,
      OrderQueryResult,
      WhereQueryResult
    >

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key7 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6],
      Key8 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7],
      Key9 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >[Key8]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5,
      key6: Key6,
      key7: Key7,
      key8: Key8,
      key9: Key9
    ): QueryField<
      Def,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >[Key8],
      Key9,
      OrderQueryResult,
      WhereQueryResult
    >

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends keyof Model,
      Key2 extends keyof Utils.AllRequired<Model>[Key1],
      Key3 extends keyof Utils.AllRequired<
        Utils.AllRequired<Model>[Key1]
      >[Key2],
      Key4 extends keyof Utils.AllRequired<
        Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
      >[Key3],
      Key5 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
        >[Key3]
      >[Key4],
      Key6 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
          >[Key3]
        >[Key4]
      >[Key5],
      Key7 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
            >[Key3]
          >[Key4]
        >[Key5]
      >[Key6],
      Key8 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
              >[Key3]
            >[Key4]
          >[Key5]
        >[Key6]
      >[Key7],
      Key9 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                >[Key3]
              >[Key4]
            >[Key5]
          >[Key6]
        >[Key7]
      >[Key8],
      Key10 extends keyof Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8]
      >[Key9]
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5,
      key6: Key6,
      key7: Key7,
      key8: Key8,
      key9: Key9,
      key10: Key10
    ): QueryField<
      Def,
      Utils.AllRequired<
        Utils.AllRequired<
          Utils.AllRequired<
            Utils.AllRequired<
              Utils.AllRequired<
                Utils.AllRequired<
                  Utils.AllRequired<
                    Utils.AllRequired<Utils.AllRequired<Model>[Key1]>[Key2]
                  >[Key3]
                >[Key4]
              >[Key5]
            >[Key6]
          >[Key7]
        >[Key8]
      >[Key9],
      Key10,
      OrderQueryResult,
      WhereQueryResult
    >

    limit(to: number): LimitQueryResult

    startAt<Parent, Key extends keyof Parent | DocId>(
      value: OrderCursorValue<Def, Parent, Key>
    ): OrderCursorStartAt<Def, Parent, Key>

    startAfter<Parent, Key extends keyof Parent | DocId>(
      value: OrderCursorValue<Def, Parent, Key>
    ): OrderCursorStartAfter<Def, Parent, Key>

    endAt<Parent, Key extends keyof Parent | DocId>(
      value: OrderCursorValue<Def, Parent, Key>
    ): OrderCursorEndAt<Def, Parent, Key>

    endBefore<Parent, Key extends keyof Parent | DocId>(
      value: OrderCursorValue<Def, Parent, Key>
    ): OrderCursorEndBefore<Def, Parent, Key>

    docId(): DocId
  }

  /**
   * Query helpers object avaliable in the `query` function.
   */
  export interface Helpers<Def extends Core.DocDef>
    extends CommonQueryHelpers<
      Def,
      Core.ResolveModelType<Def['Model']>,
      OrderQuery<Def['Model']>,
      WhereQuery<Def['Model']>,
      LimitQuery<Def['Model']>
    > {}

  /**
   * Query builder works like regular query helpers, but the run can be delayed
   * and mixed with other code.
   */
  export interface Builder<Def extends Core.DocDef, Props extends Core.DocProps>
    extends CommonQueryHelpers<
      Def,
      Core.ResolveModelType<Def['Model']>,
      void,
      void,
      void
    > {
    /**
     * Runs the built query.
     */
    run(): Core.SubscriptionPromise<
      Core.QueryRequest,
      Core.Doc<Def, Props>[],
      Core.SubscriptionListMeta<Def, Props>
    >
  }
}
