import type { TypesaurusUtils as Utils } from "./utils.js";
import type { TypesaurusCore as Core } from "./core.js";

export namespace TypesaurusQuery {
  export interface Function<Def extends Core.DocDef> {
    <
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
      Getter extends TypesaurusQuery.Getter<Def>,
    >(
      queries: Getter,
      options?: Core.ReadOptions<Environment, Props>,
    ): Getter extends ($: Helpers<Def>) => infer Result
      ? Result extends Utils.Falsy
        ? // Enable empty query to signal that the query is not ready. It allows
          // wrappers like Typesaurus React to know that it's not ready
          // to perform, e.g., when a dependency fetch is in progress or
          // the user is not authenticated. Since it's a function,
          // it's impossible towrap the query into a check because the check
          // will be invalid inside the function.
          undefined
        : SubscriptionPromise<Def, Environment, Props>
      : never;

    build<
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment },
    >(
      options?: Core.ReadOptions<Environment, Props>,
    ): Builder<Def, Props>;
  }

  export interface SubscriptionPromise<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment,
    Props extends Core.DocProps & { environment: Environment },
  > extends Core.SubscriptionPromise<
      Core.QueryRequest,
      Core.Doc<Def, Props>[],
      Core.SubscriptionListMeta<Def, Props>
    > {
    count(): Promise<number>;

    sum(
      field: keyof Utils.PickByType<Core.DocModel<Def>, number>,
    ): Promise<number>;
  }

  export type Data<Model extends Core.ModelType> =
    | Query<Model>
    | Array<Query<Model> | Utils.Falsy>
    | Utils.Falsy;

  export type Getter<Def extends Core.DocDef> = (
    $: Helpers<Def>,
  ) => Data<Def["Model"]>;

  /**
   * Query helpers object avaliable in the `query` function.
   */
  export interface Helpers<Def extends Core.DocDef>
    extends CommonQueryHelpers<
      Def,
      Core.IntersectVariableModelType<Def["Model"]>
    > {}

  /**
   * Query builder works like regular query helpers, but the run can be delayed
   * and mixed with other code.
   */
  export interface Builder<Def extends Core.DocDef, Props extends Core.DocProps>
    extends CommonQueryHelpers<
      Def,
      Core.IntersectVariableModelType<Def["Model"]>
    > {
    /**
     * Runs the built query.
     */
    run(): Core.SubscriptionPromise<
      Core.QueryRequest,
      Core.Doc<Def, Props>[],
      Core.SubscriptionListMeta<Def, Props>
    >;
  }

  export type DocId = "__id__";

  export type OrderDirection = "desc" | "asc";

  export type WhereFilter =
    | "<"
    | "<="
    | "=="
    | "!="
    | ">="
    | ">"
    | "in"
    | "not-in"
    | "array-contains"
    | "array-contains-any";

  /**
   * The query type.
   */
  export type Query<Model> =
    | OrderQuery<Model>
    | WhereQuery<Model>
    | LimitQuery<Model>
    | OrQuery<Model>;

  /**
   * The order query type. Used to build query.
   */
  export interface OrderQuery<_Model> {
    type: "order";
    field: string[];
    method: OrderDirection;
    cursors: OrderCursors<Core.DocDef, any, any>;
  }

  export interface WhereQuery<_Model> {
    type: "where";
    field: string[] | [DocId];
    filter: WhereFilter;
    value: any;
  }

  /**
   * The limit query type. It contains the limit value.
   */
  export interface LimitQuery<_Model> {
    type: "limit";
    number: number;
  }

  /**
   * The allowed or query type.
   */
  export type OrQueryQuery<Model> = WhereQuery<Model>;

  /**
   * The or query type. It contains other queries.
   */
  export interface OrQuery<Model> {
    type: "or";
    queries: OrQueryQuery<Model>[];
  }

  export type OrderCursors<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
  > =
    | Utils.Falsy
    | OrderCursorStart<Def, Parent, Key>
    | [OrderCursorStart<Def, Parent, Key> | Utils.Falsy]
    | OrderCursorEnd<Def, Parent, Key>
    | [OrderCursorEnd<Def, Parent, Key> | Utils.Falsy]
    | [
        OrderCursorStart<Def, Parent, Key> | Utils.Falsy,
        OrderCursorEnd<Def, Parent, Key> | Utils.Falsy,
      ];

  export type OrderCursorsEmpty = undefined | null | "" | false | [];

  export type OrderCursorPosition =
    | "startAt"
    | "startAfter"
    | "endBefore"
    | "endAt";

  export type OrderCursorStart<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
  > =
    | OrderCursorStartAt<Def, Parent, Key>
    | OrderCursorStartAfter<Def, Parent, Key>;

  export interface OrderCursorStartAt<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
  > extends OrderCursor<Def, Parent, Key, "startAt"> {}

  export interface OrderCursorStartAfter<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
  > extends OrderCursor<Def, Parent, Key, "startAfter"> {}

  export type OrderCursorEnd<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
  > =
    | OrderCursorEndAt<Def, Parent, Key>
    | OrderCursorEndBefore<Def, Parent, Key>;

  export interface OrderCursorEndAt<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
  > extends OrderCursor<Def, Parent, Key, "endAt"> {}

  export interface OrderCursorEndBefore<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
  > extends OrderCursor<Def, Parent, Key, "endBefore"> {}

  export interface OrderCursor<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
    Position extends OrderCursorPosition,
  > {
    type: "cursor";
    position: Position;
    value: OrderCursorValue<Def, Parent, Key>;
  }

  export type OrderCursorValue<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
  > =
    | (Key extends QueryFieldKey1<Parent>
        ? QueryFieldValue<Parent, Key>
        : Def["Id"]) // Field value or id
    | Core.Doc<Def, Core.DocProps> // Will be used to get value for the cursor
    | undefined; // Indicates the start of the query

  export interface QueryFieldBase<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent> | DocId,
  > {
    // With cursors
    order(
      cursors?: OrderCursors<Def, Parent, Key> | [],
    ): OrderQuery<Def["Model"]>;

    // With method and cursors
    order(
      method: OrderDirection,
      cursors?: OrderCursors<Def, Parent, Key> | [],
    ): OrderQuery<Def["Model"]>;
  }

  export interface QueryIdField<Def extends Core.DocDef>
    extends QueryFieldBase<Def, Def["Model"], DocId> {
    lt(id: Def["Id"]): WhereQuery<Def["Model"]>;

    lte(id: Def["Id"]): WhereQuery<Def["Model"]>;

    eq(id: Def["Id"]): WhereQuery<Def["Model"]>;

    not(id: Def["Id"]): WhereQuery<Def["Model"]>;

    gt(id: Def["Id"]): WhereQuery<Def["Model"]>;

    gte(id: Def["Id"]): WhereQuery<Def["Model"]>;

    in(ids: Def["Id"][]): WhereQuery<Def["Model"]>;

    notIn(ids: Def["Id"][]): WhereQuery<Def["Model"]>;
  }

  export interface QueryPrimitiveField<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent>,
  > extends QueryFieldBase<Def, Parent, Key> {
    lt(field: QueryFieldValue<Parent, Key>): WhereQuery<Def["Model"]>;

    lte(field: QueryFieldValue<Parent, Key>): WhereQuery<Def["Model"]>;

    eq(field: QueryFieldValue<Parent, Key>): WhereQuery<Def["Model"]>;

    not(field: QueryFieldValue<Parent, Key>): WhereQuery<Def["Model"]>;

    gt(field: QueryFieldValue<Parent, Key>): WhereQuery<Def["Model"]>;

    gte(field: QueryFieldValue<Parent, Key>): WhereQuery<Def["Model"]>;

    in(fields: QueryFieldValue<Parent, Key>[]): WhereQuery<Def["Model"]>;

    notIn(fields: QueryFieldValue<Parent, Key>[]): WhereQuery<Def["Model"]>;
  }

  export interface QueryArrayField<
    Model,
    Parent,
    Key extends QueryFieldKey1<Parent>,
  > {
    contains(
      field: Exclude<QueryFieldGet1<Parent, Key>, undefined> extends Array<
        infer ItemType
      >
        ? QueryFieldValueNonNullish<ItemType>
        : never,
    ): WhereQuery<Model>;

    containsAny(
      field: Exclude<QueryFieldGet1<Parent, Key>, undefined> extends Array<any>
        ? QueryFieldValue<Parent, Key>
        : never,
    ): WhereQuery<Model>;
  }

  export type QueryField<
    Def extends Core.DocDef,
    Parent,
    Key extends QueryFieldKey1<Parent>,
  > =
    Exclude<QueryFieldGet1<Parent, Key>, undefined> extends Array<any>
      ? QueryArrayField<Def["Model"], Parent, Key>
      : QueryPrimitiveField<Def, Parent, Key>;

  export type QueryFieldValue<Parent, Key extends QueryFieldKey1<Parent>> =
    | // Unless the original field type is unknown, union with it
    (unknown extends Parent[Key]
        ? never
        : // We process server date separately
          Exclude<Parent[Key], Core.ServerDate>)
    | QueryFieldValueNonNullish<QueryFieldGet1<Parent, Key>>;

  export type QueryFieldValueNonNullish<Value> =
    Exclude<Value, undefined> extends Core.ServerDate
      ? Exclude<Value, Core.ServerDate> | Date
      : Value;

  /**
   * Common query helpers API with query object result passed as a generic.
   */
  export interface CommonQueryHelpers<
    Def extends Core.DocDef,
    Model extends Core.ModelObjectType,
  > {
    /**
     * Id selector, allows querying by the document id.
     */
    field(id: DocId): QueryIdField<Def>;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<Key extends QueryFieldKey1<Model>>(
      key: Key,
    ): QueryField<Def, Model, Key>;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends QueryFieldKey1<Model>,
      Key2 extends QueryFieldKey2<Model, Key1>,
    >(
      key1: Key1,
      key2: Key2,
    ): QueryField<Def, QueryFieldGet1<Model, Key1>, Key2>;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends QueryFieldKey1<Model>,
      Key2 extends QueryFieldKey2<Model, Key1>,
      Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
    ): QueryField<Def, QueryFieldGet2<Model, Key1, Key2>, Key3>;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends QueryFieldKey1<Model>,
      Key2 extends QueryFieldKey2<Model, Key1>,
      Key3 extends QueryFieldKey3<Model, Key1, Key2>,
      Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
    ): QueryField<Def, QueryFieldGet3<Model, Key1, Key2, Key3>, Key4>;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends QueryFieldKey1<Model>,
      Key2 extends QueryFieldKey2<Model, Key1>,
      Key3 extends QueryFieldKey3<Model, Key1, Key2>,
      Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
      Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5,
    ): QueryField<Def, QueryFieldGet4<Model, Key1, Key2, Key3, Key4>, Key5>;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends QueryFieldKey1<Model>,
      Key2 extends QueryFieldKey2<Model, Key1>,
      Key3 extends QueryFieldKey3<Model, Key1, Key2>,
      Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
      Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
      Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5,
      key6: Key6,
    ): QueryField<
      Def,
      QueryFieldGet5<Model, Key1, Key2, Key3, Key4, Key5>,
      Key6
    >;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends QueryFieldKey1<Model>,
      Key2 extends QueryFieldKey2<Model, Key1>,
      Key3 extends QueryFieldKey3<Model, Key1, Key2>,
      Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
      Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
      Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
      Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5,
      key6: Key6,
      key7: Key7,
    ): QueryField<
      Def,
      QueryFieldGet6<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
      Key7
    >;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends QueryFieldKey1<Model>,
      Key2 extends QueryFieldKey2<Model, Key1>,
      Key3 extends QueryFieldKey3<Model, Key1, Key2>,
      Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
      Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
      Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
      Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
      Key8 extends QueryFieldKey8<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7
      >,
    >(
      key1: Key1,
      key2: Key2,
      key3: Key3,
      key4: Key4,
      key5: Key5,
      key6: Key6,
      key7: Key7,
      key8: Key8,
    ): QueryField<
      Def,
      QueryFieldGet7<Model, Key1, Key2, Key3, Key4, Key5, Key6, Key7>,
      Key8
    >;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends QueryFieldKey1<Model>,
      Key2 extends QueryFieldKey2<Model, Key1>,
      Key3 extends QueryFieldKey3<Model, Key1, Key2>,
      Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
      Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
      Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
      Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
      Key8 extends QueryFieldKey8<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7
      >,
      Key9 extends QueryFieldKey9<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7,
        Key8
      >,
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
    ): QueryField<
      Def,
      QueryFieldGet8<Model, Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8>,
      Key9
    >;

    /**
     * Field selector, allows querying by a specific field.
     */
    field<
      Key1 extends QueryFieldKey1<Model>,
      Key2 extends QueryFieldKey2<Model, Key1>,
      Key3 extends QueryFieldKey3<Model, Key1, Key2>,
      Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
      Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
      Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
      Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
      Key8 extends QueryFieldKey8<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7
      >,
      Key9 extends QueryFieldKey9<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7,
        Key8
      >,
      Key10 extends QueryFieldKey10<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7,
        Key8,
        Key9
      >,
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
      key10: Key10,
    ): QueryField<
      Def,
      QueryFieldGet9<
        Model,
        Key1,
        Key2,
        Key3,
        Key4,
        Key5,
        Key6,
        Key7,
        Key8,
        Key9
      >,
      Key10
    >;

    limit(to: number): LimitQuery<Model>;

    startAt<Parent, Key extends QueryFieldKey1<Parent> | DocId>(
      value: OrderCursorValue<Def, Parent, Key>,
    ): OrderCursorStartAt<Def, Parent, Key>;

    startAfter<Parent, Key extends QueryFieldKey1<Parent> | DocId>(
      value: OrderCursorValue<Def, Parent, Key>,
    ): OrderCursorStartAfter<Def, Parent, Key>;

    endAt<Parent, Key extends QueryFieldKey1<Parent> | DocId>(
      value: OrderCursorValue<Def, Parent, Key>,
    ): OrderCursorEndAt<Def, Parent, Key>;

    endBefore<Parent, Key extends QueryFieldKey1<Parent> | DocId>(
      value: OrderCursorValue<Def, Parent, Key>,
    ): OrderCursorEndBefore<Def, Parent, Key>;

    docId(): DocId;

    or(...queries: OrQueryQuery<Model>[]): OrQuery<Model>;
  }

  /// Query utils

  //// QueryFieldKeyX

  export type QueryFieldKey1<Model> = Utils.UnionKeys<Utils.AllRequired<Model>>;

  export type QueryFieldKey2<
    Model,
    Key1 extends QueryFieldKey1<Model>,
  > = QueryFieldKey1<QueryFieldGet1<Model, Key1>>;

  export type QueryFieldKey3<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
  > = QueryFieldKey1<QueryFieldGet2<Model, Key1, Key2>>;

  export type QueryFieldKey4<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
  > = QueryFieldKey1<QueryFieldGet3<Model, Key1, Key2, Key3>>;

  export type QueryFieldKey5<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
  > = QueryFieldKey1<QueryFieldGet4<Model, Key1, Key2, Key3, Key4>>;

  export type QueryFieldKey6<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
  > = QueryFieldKey1<QueryFieldGet5<Model, Key1, Key2, Key3, Key4, Key5>>;

  export type QueryFieldKey7<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
  > = QueryFieldKey1<QueryFieldGet6<Model, Key1, Key2, Key3, Key4, Key5, Key6>>;

  export type QueryFieldKey8<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
    Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
  > = QueryFieldKey1<
    QueryFieldGet7<Model, Key1, Key2, Key3, Key4, Key5, Key6, Key7>
  >;

  export type QueryFieldKey9<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
    Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
    Key8 extends QueryFieldKey8<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7
    >,
  > = QueryFieldKey1<
    QueryFieldGet8<Model, Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8>
  >;

  export type QueryFieldKey10<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
    Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
    Key8 extends QueryFieldKey8<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7
    >,
    Key9 extends QueryFieldKey9<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7,
      Key8
    >,
  > = QueryFieldKey1<
    QueryFieldGet9<Model, Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9>
  >;

  //// QueryFieldGetX

  export type QueryFieldGet1<
    Model,
    Key extends QueryFieldKey1<Model>,
  > = Utils.UnionValue<Utils.AllRequired<Model>, Key>;

  export type QueryFieldGet2<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
  > = QueryFieldGet1<QueryFieldGet1<Model, Key1>, Key2>;

  export type QueryFieldGet3<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
  > = QueryFieldGet1<QueryFieldGet2<Model, Key1, Key2>, Key3>;

  export type QueryFieldGet4<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
  > = QueryFieldGet1<QueryFieldGet3<Model, Key1, Key2, Key3>, Key4>;

  export type QueryFieldGet5<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
  > = QueryFieldGet1<QueryFieldGet4<Model, Key1, Key2, Key3, Key4>, Key5>;

  export type QueryFieldGet6<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
  > = QueryFieldGet1<QueryFieldGet5<Model, Key1, Key2, Key3, Key4, Key5>, Key6>;

  export type QueryFieldGet7<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
    Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
  > = QueryFieldGet1<
    QueryFieldGet6<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
    Key7
  >;

  export type QueryFieldGet8<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
    Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
    Key8 extends QueryFieldKey8<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7
    >,
  > = QueryFieldGet1<
    QueryFieldGet7<Model, Key1, Key2, Key3, Key4, Key5, Key6, Key7>,
    Key8
  >;

  export type QueryFieldGet9<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
    Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
    Key8 extends QueryFieldKey8<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7
    >,
    Key9 extends QueryFieldKey9<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7,
      Key8
    >,
  > = QueryFieldGet1<
    QueryFieldGet8<Model, Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8>,
    Key9
  >;

  export type QueryFieldGet10<
    Model,
    Key1 extends QueryFieldKey1<Model>,
    Key2 extends QueryFieldKey2<Model, Key1>,
    Key3 extends QueryFieldKey3<Model, Key1, Key2>,
    Key4 extends QueryFieldKey4<Model, Key1, Key2, Key3>,
    Key5 extends QueryFieldKey5<Model, Key1, Key2, Key3, Key4>,
    Key6 extends QueryFieldKey6<Model, Key1, Key2, Key3, Key4, Key5>,
    Key7 extends QueryFieldKey7<Model, Key1, Key2, Key3, Key4, Key5, Key6>,
    Key8 extends QueryFieldKey8<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7
    >,
    Key9 extends QueryFieldKey9<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7,
      Key8
    >,
    Key10 extends QueryFieldKey10<
      Model,
      Key1,
      Key2,
      Key3,
      Key4,
      Key5,
      Key6,
      Key7,
      Key8,
      Key9
    >,
  > = QueryFieldGet1<
    QueryFieldGet9<Model, Key1, Key2, Key3, Key4, Key5, Key6, Key7, Key8, Key9>,
    Key10
  >;
}
