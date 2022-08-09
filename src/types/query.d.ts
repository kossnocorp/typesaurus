import type { Typesaurus } from '..'

export namespace TypesaurusQuery {
  export class DocId {}

  export type OrderDirection = 'desc' | 'asc'

  export type WhereFilter =
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'not-in'
    | 'array-contains-any'

  /**
   * The query type.
   */
  export type Query<Model, Key extends keyof Model | DocId> =
    | OrderQuery<Model, Key>
    | WhereQuery<Model>
    | LimitQuery

  /**
   * The order query type. Used to build query.
   */
  export interface OrderQuery<Model, Key extends keyof Model | DocId> {
    type: 'order'
    field: Key
    method: OrderDirection
    cursors: OrderCursors<Model, Key>
  }

  export interface WhereQuery<_Model> {
    type: 'where'
    field: string | string[] | DocId
    filter: WhereFilter
    value: any
  }

  /**
   * The limit query type. It contains the limit value.
   */
  export interface LimitQuery {
    type: 'limit'
    number: number
  }

  export type OrderCursors<Model, Key extends keyof Model | DocId> =
    | [OrderCursorStart<Model, Key>]
    | [OrderCursorEnd<Model, Key>]
    | [OrderCursorStart<Model, Key>, OrderCursorEnd<Model, Key>]

  export type OrderCursorPosition =
    | 'startAt'
    | 'startAfter'
    | 'endBefore'
    | 'endAt'

  export type OrderCursorStart<Model, Key extends keyof Model | DocId> =
    | OrderCursorStartAt<Model, Key>
    | OrderCursorStartAfter<Model, Key>

  export interface OrderCursorStartAt<Model, Key extends keyof Model | DocId>
    extends OrderCursor<'startAt', Model, Key> {}

  export interface OrderCursorStartAfter<Model, Key extends keyof Model | DocId>
    extends OrderCursor<'startAfter', Model, Key> {}

  export type OrderCursorEnd<Model, Key extends keyof Model | DocId> =
    | OrderCursorEndAt<Model, Key>
    | OrderCursorEndBefore<Model, Key>

  export interface OrderCursorEndAt<Model, Key extends keyof Model | DocId>
    extends OrderCursor<'endAt', Model, Key> {}

  export interface OrderCursorEndBefore<Model, Key extends keyof Model | DocId>
    extends OrderCursor<'endBefore', Model, Key> {}

  export interface OrderCursor<
    Position extends OrderCursorPosition,
    Model,
    Key extends keyof Model | DocId
  > {
    type: 'cursor'
    position: Position
    value: OrderCursorValue<Model, Key>
  }

  export type OrderCursorValue<Model, Key extends keyof Model | DocId> =
    | (Key extends keyof Model ? Model[Key] : string) // Field value or id
    | Typesaurus.Doc<Model> // Will be used to get value for the cursor
    | undefined // Indicates the start of the query

  export type QueryGetter<Model> = (
    $: QueryHelpers<Model>
  ) => Query<Model, keyof Model | DocId>[]

  export interface QueryHelpers<Model> {
    where<Key extends keyof Model>(
      field: DocId,
      filter: WhereFilter,
      value: string
    ): WhereQuery<DocId>

    where<Key extends keyof Model>(
      field: Key,
      filter: WhereFilter,
      value: Model[Key]
    ): WhereQuery<Model>

    where<Key1 extends keyof Model, Key2 extends keyof Model[Key1]>(
      field: [Key1, Key2],
      filter: WhereFilter,
      value: Model[Key1][Key2]
    ): WhereQuery<Model>

    order<Key extends keyof Model | DocId>(key: Key): OrderQuery<Model, Key>

    order<Key extends keyof Model | DocId>(
      key: Key,
      ...cursors: OrderCursors<Model, Key> | []
    ): OrderQuery<Model, Key>

    order<Key extends keyof Model | DocId>(
      key: Key,
      method: OrderDirection,
      ...cursors: OrderCursors<Model, Key> | []
    ): OrderQuery<Model, Key>

    limit(to: number): LimitQuery

    startAt<Model, Key extends keyof Model | DocId>(
      value: OrderCursorValue<Model, Key>
    ): OrderCursorStartAt<Model, Key>

    startAfter<Model, Key extends keyof Model | DocId>(
      value: OrderCursorValue<Model, Key>
    ): OrderCursorStartAfter<Model, Key>

    endAt<Model, Key extends keyof Model | DocId>(
      value: OrderCursorValue<Model, Key>
    ): OrderCursorEndAt<Model, Key>

    endBefore<Model, Key extends keyof Model | DocId>(
      value: OrderCursorValue<Model, Key>
    ): OrderCursorEndBefore<Model, Key>

    docId(): DocId
  }
}
