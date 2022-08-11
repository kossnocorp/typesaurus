import type { Typesaurus } from '..'
import { TypesaurusUtils } from '../utils'

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
    | 'array-contains'
    | 'in'
    | 'not-in'
    | 'array-contains-any'

  export type BasicWhereFilter = Exclude<WhereFilter, 'array-contains' | 'in'>

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
    field: string
    method: OrderDirection
    cursors: OrderCursors<any, any>
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
  export interface LimitQuery<_Model> {
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
    | (Key extends keyof Model ? Model[Key] : Typesaurus.Id<Model>) // Field value or id
    | Typesaurus.Doc<Model> // Will be used to get value for the cursor
    | undefined // Indicates the start of the query

  export type QueryGetter<Model> = (
    $: QueryHelpers<Model>
  ) => Query<Model> | Query<Model>[]

  export interface QueryHelpers<Model> {
    /*
                     oooo                                     
                     `888                                     
    oooo oooo    ooo  888 .oo.    .ooooo.  oooo d8b  .ooooo.  
     `88. `88.  .8'   888P"Y88b  d88' `88b `888""8P d88' `88b 
      `88..]88..8'    888   888  888ooo888  888     888ooo888 
       `888'`888'     888   888  888    .o  888     888    .o 
        `8'  `8'     o888o o888o `Y8bod8P' d888b    `Y8bod8P' 
    */

    // 1-level keys path

    // Basic filter
    where<Key extends keyof Model | DocId>(
      field: Key | [Key],
      filter: BasicWhereFilter,
      value: Key extends keyof Model ? Model[Key] : Typesaurus.Id<Model>
    ): WhereQuery<Model>
    // in filter
    where<Key extends keyof Model | DocId>(
      field: Key | [Key],
      filter: 'in',
      value: Key extends keyof Model ? Model[Key][] : Typesaurus.Id<Model>[]
    ): WhereQuery<Model>
    // array-contains filter
    where<Key extends keyof Model>(
      field: Key | [Key],
      filter: 'array-contains',
      value: TypesaurusUtils.AllRequired<Model>[Key] extends Array<
        infer ItemType
      >
        ? ItemType
        : never
    ): WhereQuery<Model>

    // 2-level keys path

    // Basic filter
    where<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      field: [Key1, Key2],
      filter: BasicWhereFilter,
      value: TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    ): WhereQuery<Model>
    // in filter
    where<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      field: [Key1, Key2],
      filter: 'in',
      value: TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2][]
    ): WhereQuery<Model>
    // array-contains filter
    where<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      field: [Key1, Key2],
      filter: 'array-contains',
      value: TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2] extends Array<infer ItemType>
        ? ItemType
        : never
    ): WhereQuery<Model>

    // 3-level keys path

    // Basic filter
    where<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    >(
      field: [Key1, Key2, Key3],
      filter: BasicWhereFilter,
      value: TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<
          TypesaurusUtils.AllRequired<Model>[Key1]
        >[Key2]
      >[Key3]
    ): WhereQuery<Model>
    // in filter
    where<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    >(
      field: [Key1, Key2, Key3],
      filter: 'in',
      value: TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<
          TypesaurusUtils.AllRequired<Model>[Key1]
        >[Key2]
      >[Key3][]
    ): WhereQuery<Model>
    // array-contains filter
    where<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    >(
      field: [Key1, Key2, Key3],
      filter: 'array-contains',
      value: TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<
          TypesaurusUtils.AllRequired<Model>[Key1]
        >[Key2]
      >[Key3] extends Array<infer ItemType>
        ? ItemType
        : never
    ): WhereQuery<Model>

    /*
                             .o8                     
                            "888                     
     .ooooo.  oooo d8b  .oooo888   .ooooo.  oooo d8b 
    d88' `88b `888""8P d88' `888  d88' `88b `888""8P 
    888   888  888     888   888  888ooo888  888     
    888   888  888     888   888  888    .o  888     
    `Y8bod8P' d888b    `Y8bod88P" `Y8bod8P' d888b    
    */

    // 1-level keys path

    // Only key
    order<Key extends keyof Model | DocId>(key: Key | [Key]): OrderQuery<Model>
    // With cursors
    order<Key extends keyof Model | DocId>(
      key: Key | readonly [Key],
      ...cursors: OrderCursors<Model, Key> | []
    ): OrderQuery<Model>
    // With method and cursors
    order<Key extends keyof Model | DocId>(
      key: Key | readonly [Key],
      method: OrderDirection,
      ...cursors: OrderCursors<Model, Key> | []
    ): OrderQuery<Model>

    // 2-level keys path

    // Only key
    order<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      key: readonly [Key1, Key2]
    ): OrderQuery<Model>
    // With cursors
    order<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      key: readonly [Key1, Key2],
      ...cursors:
        | OrderCursors<
            TypesaurusUtils.AllRequired<
              TypesaurusUtils.AllRequired<Model>[Key1]
            >,
            Key2
          >
        | []
    ): OrderQuery<Model>
    // With method and cursors
    order<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1]
    >(
      key: readonly [Key1, Key2],
      method: OrderDirection,
      ...cursors:
        | OrderCursors<
            TypesaurusUtils.AllRequired<
              TypesaurusUtils.AllRequired<Model>[Key1]
            >,
            Key2
          >
        | []
    ): OrderQuery<Model>

    // 3-level keys path

    // Only key
    order<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    >(
      field: readonly [Key1, Key2, Key3]
    ): OrderQuery<Model>
    // With cursors
    order<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    >(
      field: readonly [Key1, Key2, Key3],
      ...cursors:
        | OrderCursors<
            TypesaurusUtils.AllRequired<
              TypesaurusUtils.AllRequired<
                TypesaurusUtils.AllRequired<Model>[Key1]
              >[Key2]
            >,
            Key3
          >
        | []
    ): OrderQuery<Model>
    // With method and cursors
    order<
      Key1 extends keyof Model,
      Key2 extends keyof TypesaurusUtils.AllRequired<Model>[Key1],
      Key3 extends keyof TypesaurusUtils.AllRequired<
        TypesaurusUtils.AllRequired<Model>[Key1]
      >[Key2]
    >(
      field: readonly [Key1, Key2, Key3],
      method: OrderDirection,
      ...cursors:
        | OrderCursors<
            TypesaurusUtils.AllRequired<
              TypesaurusUtils.AllRequired<
                TypesaurusUtils.AllRequired<Model>[Key1]
              >[Key2]
            >,
            Key3
          >
        | []
    ): OrderQuery<Model>

    /*
                                .o8  
                               "888  
     .ooooo.  ooo. .oo.    .oooo888  
    d88' `88b `888P"Y88b  d88' `888  
    888ooo888  888   888  888   888  
    888    .o  888   888  888   888  
    `Y8bod8P' o888o o888o `Y8bod88P" 
    */

    limit(to: number): LimitQuery<Model>

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
