import type { TypesaurusUtils as Utils } from './utils'
import type { TypesaurusQuery as Query } from './query'
import type { TypesaurusUpdate as Update } from './update'

export namespace TypesaurusCore {
  export interface Function {
    <Schema extends PlainSchema>(
      getSchema: ($: SchemaHelpers) => Schema
    ): DB<Schema>
  }

  export type Id<Path extends string> = string & {
    __dontUseWillBeUndefined__: Path
  }

  export type ModelType = ModelObjectType | ModelVariableType

  export type ModelVariableType =
    | [ModelObjectType, ModelObjectType]
    | [ModelObjectType, ModelObjectType, ModelObjectType]
  // | [ModelObjectType, ModelObjectType, ModelObjectType, ModelObjectType]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]
  // | [
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType,
  //     ModelObjectType
  //   ]

  export type ModelObjectType = object & { length?: never }

  export type ResolveModelType<Model extends ModelType> = Model extends [
    infer A extends ModelObjectType,
    infer B extends ModelObjectType,
    infer C extends ModelObjectType
  ]
    ? A | B | C
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType
      ]
    ? A | B
    : Model extends ModelObjectType
    ? Model
    : never

  export type SharedModelType<Model extends ModelType> = Model extends [
    infer A extends ModelObjectType,
    infer B extends ModelObjectType,
    infer C extends ModelObjectType
  ]
    ? Utils.SharedShape3<A, B, C>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType
      ]
    ? Utils.SharedShape2<A, B>
    : Model extends ModelObjectType
    ? Model
    : never

  export interface DocDefFlags {
    Reduced: boolean
  }

  export interface DocDef {
    Model: ModelType
    Id: Id<string>
    /**
     * If the collection has variable shape, it will contain models tuple,
     * otherwise it will be equal {@link Model}.
     */
    WideModel: ModelType
    Flags: DocDefFlags
  }

  export interface DocProps {
    environment: RuntimeEnvironment
    source: DataSource
    dateStrategy: ServerDateStrategy
    pendingWrites: boolean
  }

  /**
   * The type of a `DocumentChange` may be 'added', 'removed', or 'modified'.
   */
  export type DocChangeType = 'added' | 'removed' | 'modified'

  /**
   * Doc change information. It contains the type of change, the doc after
   * the change, and the position change.
   */
  export interface DocChange<Def extends DocDef, Props extends DocProps> {
    /** The type of change. */
    readonly type: DocChangeType

    /** The document affected by this change. */
    readonly doc: Doc<Def, Props>

    /**
     * The index of the changed document in the result set immediately prior to
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange` objects
     * have been applied). Is -1 for 'added' events.
     */
    readonly oldIndex: number

    /**
     * The index of the changed document in the result set immediately after
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange`
     * objects and the current `DocumentChange` object have been applied).
     * Is -1 for 'removed' events.
     */
    readonly newIndex: number
  }

  /**
   * An options object that configures the snapshot contents of `all` and
   * `query`.
   */
  export interface SubscriptionListMeta<
    Def extends DocDef,
    Props extends DocProps
  > {
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     */
    changes: () => DocChange<Def, Props>[]

    /** The number of documents in the QuerySnapshot. */
    readonly size: number

    /** True if there are no documents in the QuerySnapshot. */
    readonly empty: boolean
  }

  export interface DocOptions<Props extends DocProps> {
    serverTimestamps?: Props['dateStrategy']
  }

  export interface ReadOptions<Props extends DocProps>
    extends DocOptions<Props>,
      OperationOptions<Props['environment']> {}

  export type ReduceDef<
    Def extends DocDef,
    ReduceToModel,
    Flags = Def['Flags']
  > = {
    Model: ReduceToModel
    Id: Def['Id']
    WideModel: Def['WideModel']
    Flags: Flags
  }

  // export type VariableDoc<Def extends DocDef, Props extends DocProps> = Doc<
  //   Def,
  //   Props
  // >

  // export type VariableDoc<
  //   Def extends DocDef,
  //   Props extends DocProps
  // > = Def['Model'] extends [
  //   infer A extends ModelType,
  //   infer B extends ModelType,
  //   infer C extends ModelType
  // ]
  //   ?
  //       | Doc<ReduceDef<Def, A>, Props>
  //       | Doc<ReduceDef<Def, B>, Props>
  //       | Doc<ReduceDef<Def, C>, Props>
  //   : Def['Model'] extends [
  //       infer A extends ModelType,
  //       infer B extends ModelType
  //     ]
  //   ? // ? Doc<ReduceDef<Def, A>, Props> | Doc<ReduceDef<Def, B>, Props>
  //     | Doc<
  //           {
  //             Model: Def['Model']
  //             Id: Def['Id']
  //             WideModel: Def['WideModel']
  //             Flags: Def['Flags'] & { Reduced: A }
  //           },
  //           Props
  //         >
  //       | Doc<
  //           {
  //             Model: Def['Model']
  //             Id: Def['Id']
  //             WideModel: Def['WideModel']
  //             Flags: Def['Flags'] & { Reduced: B }
  //           },
  //           Props
  //         >
  //   : Doc<Def, Props>

  /**
   * Variable shape document. This alias is needed to make `reduce` method work.
   * It tells TypeScript that the doc might be one of the given types.
   */
  export type VariableDoc<
    Def extends DocDef,
    Props extends DocProps
  > = Def['Model'] extends [
    infer A extends ModelType,
    infer B extends ModelType,
    infer C extends ModelType
  ]
    ?
        | Doc<ReduceDef<Def, A>, Props>
        | Doc<ReduceDef<Def, B>, Props>
        | Doc<ReduceDef<Def, C>, Props>
    : Def['Model'] extends [
        infer A extends ModelType,
        infer B extends ModelType
      ]
    ? Doc<ReduceDef<Def, A>, Props> | Doc<ReduceDef<Def, B>, Props>
    : Doc<Def, Props>

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export interface Doc<Def extends DocDef, Props extends DocProps>
    extends DocAPI<Def> {
    type: 'doc'

    ref: Ref<Def>

    data: Props['environment'] extends 'server'
      ? ModelServerData<Def['Model']>
      : Props['source'] extends 'database'
      ? AnyModelData<Def['Model'], 'present'>
      : Props['dateStrategy'] extends 'estimate' | 'previous'
      ? AnyModelData<Def['Model'], 'present'>
      : AnyModelData<Def['Model'], 'nullable'>

    props: Props

    test<Props extends Partial<DocProps>>(
      props: Props
    ): this is Doc<Def, DocProps & Props>

    assert<Props extends Partial<DocProps>>(
      props: Props
    ): asserts this is Doc<Def, DocProps & Props>
  }

  export type ModelServerData<Model extends ModelType> = AnyModelData<
    Model,
    'present'
  >

  export type ModelData<Model extends ModelType> = AnyModelData<
    Model,
    ServerDateNullable
  >

  export type AnyModelData<
    Model extends ModelType,
    DateNullable extends ServerDateNullable
  > = {
    [Key in keyof Model]: ModelField<Model[Key], DateNullable>
  }

  export type ModelField<
    Field,
    DateNullable extends ServerDateNullable
  > = Field extends Ref<any>
    ? ModelFieldNullable<Field>
    : Field extends ServerDate // Process server dates
    ? DateNullable extends 'nullable'
      ? Date | null
      : ModelFieldNullable<Date>
    : Field extends Date | Id<string> // Stop dates & ids from being processed as an object
    ? ModelFieldNullable<Field>
    : Field extends object // If it's an object, recursively pass through ModelData
    ? AnyModelData<Field, DateNullable>
    : ModelFieldNullable<Field>

  export type ModelFieldNullable<Type> = Type extends undefined
    ? Type | null
    : Type

  export type ResolvedWebServerDate<
    FromCache extends boolean,
    DateStrategy extends ServerDateStrategy
  > = FromCache extends false | undefined // Server date is always defined when not from cache
    ? Date
    : DateStrategy extends 'estimate' | 'previous' // Or when the estimate or previous strategy were used
    ? Date
    : Date | null

  /**
   * The document reference type.
   */
  export interface Ref<Def extends DocDef> extends DocAPI<Def> {
    type: 'ref'
    collection: RichCollection<Def>
    id: Def['Id']
  }

  export type ServerDateNullable = 'nullable' | 'present'

  export type ServerDateStrategy = 'estimate' | 'previous' | 'none'

  export type RuntimeEnvironment = 'server' | 'client'

  export type DataSource = 'cache' | 'database'

  export interface ServerDate extends Date {
    __dontUseWillBeUndefined__: true
  }

  export type SetModelArg<
    Model extends ModelObjectType,
    Props extends DocProps
  > = SetModel<Model, Props> | SetModelGetter<Model, Props>

  /**
   * Write model getter, accepts helper functions with special value generators
   * and returns {@link SetModel}.
   */
  export type SetModelGetter<
    Model extends ModelObjectType,
    Props extends DocProps
  > = ($: WriteHelpers<Model>) => SetModel<Model, Props>

  /**
   * Type of the data passed to write functions. It extends the model allowing
   * to set special values, sucha as server date, increment, etc.
   */
  export type SetModel<Data, Props extends DocProps> = {
    [Key in keyof Data]: WriteValueNullable<
      Data[Key],
      WriteValue<Data, Key, Props>
    >
  }

  export type WriteValue<
    Data,
    Key extends keyof Data,
    Props extends DocProps
  > = Exclude<Data[Key], undefined> extends infer Type // Exclude undefined
    ? Type extends ServerDate // First, ensure ServerDate is properly set
      ? WriteValueServerDate<Data, Key, Props>
      : Type extends Array<infer ItemType>
      ? WriteValueArray<Data, Key, ItemType>
      : Type extends object // If it's an object, recursively pass through SetModel
      ? WriteValueObject<Data, Key, Props>
      : Type extends number
      ? WriteValueNumber<Data, Key>
      : WriteValueOther<Data, Key>
    : never

  export type WriteValueNullable<OriginType, Value> =
    OriginType extends undefined ? Value | null : Value

  export type WriteValueServerDate<
    Model,
    Key extends keyof Model,
    Props extends DocProps
  > = Props['environment'] extends 'server' // Date can be used only in the server environment
    ? Date | ValueServerDate | MaybeValueRemove<Model, Key>
    : ValueServerDate | MaybeValueRemove<Model, Key>

  export type WriteValueArray<Model, Key extends keyof Model, ItemType> =
    | Model[Key]
    | ValueArrayUnion<ItemType>
    | ValueArrayRemove<ItemType>
    | MaybeValueRemove<Model, Key>

  export type WriteValueNumber<Model, Key extends keyof Model> =
    | Model[Key]
    | ValueIncrement
    | MaybeValueRemove<Model, Key>

  export type WriteValueOther<Model, Key extends keyof Model> =
    | Model[Key]
    | MaybeValueRemove<Model, Key>

  export type WriteValueObject<
    Model,
    Key extends keyof Model,
    Props extends DocProps
  > =
    | SetModel<Model[Key], Props> // Even for update, nested objects are passed to set model
    | MaybeValueRemove<Model, Key>

  export type Value<Type> =
    | ValueRemove
    | ValueIncrement
    | ValueArrayUnion<Type>
    | ValueArrayRemove<Type>
    | ValueServerDate

  /**
   * Available value kinds.
   */
  export type ValueKind =
    | 'remove'
    | 'increment'
    | 'arrayUnion'
    | 'arrayRemove'
    | 'serverDate'

  /**
   * The remove value type.
   */
  export interface ValueRemove {
    type: 'value'
    kind: 'remove'
  }

  /**
   * The increment value type. It holds the increment value.
   */
  export interface ValueIncrement {
    type: 'value'
    kind: 'increment'
    number: number
  }

  /**
   * The array union value type. It holds the payload to union.
   */
  export interface ValueArrayUnion<Type> {
    type: 'value'
    kind: 'arrayUnion'
    values: Type[]
  }

  /**
   * The array remove value type. It holds the data to remove from the target array.
   */
  export interface ValueArrayRemove<Type> {
    type: 'value'
    kind: 'arrayRemove'
    values: Type[]
  }

  /**
   * The server date value type.
   */
  export interface ValueServerDate {
    type: 'value'
    kind: 'serverDate'
  }

  export type MaybeValueRemoveOr<
    Model,
    Key extends keyof Model,
    ValueType
  > = Partial<Pick<Model, Key>> extends Pick<Model, Key>
    ? ValueRemove | ValueType
    : ValueType

  export type MaybeValueRemove<
    Model,
    Key extends keyof Model
  > = Utils.RequiredKey<Model, Key> extends true ? never : ValueRemove

  export type Undefined<T> = T extends undefined ? T : never

  export interface WriteHelpers<_Model> {
    serverDate(): ValueServerDate

    remove(): ValueRemove

    increment(value: number): ValueIncrement

    arrayUnion<Type>(values: Type | Type[]): ValueArrayUnion<Type>

    arrayRemove<Type>(values: Type | Type[]): ValueArrayRemove<Type>
  }

  export interface SchemaHelpers {
    collection<
      Model extends ModelType,
      CustomId extends Id<string> | undefined = undefined
    >(): PlainCollection<Model, CustomId>
  }

  export interface OperationOptions<Environment extends RuntimeEnvironment> {
    as?: Environment
  }

  export type SubscriptionErrorCallback = (error: unknown) => any

  export type OffSubscription = () => void

  export interface OffSubscriptionWithCatch {
    (): void
    catch(callback: SubscriptionErrorCallback): OffSubscription
  }

  export interface SubscriptionPromise<
    Request,
    Result,
    SubscriptionMeta = undefined
  > extends Promise<Result> {
    request: Request

    on: SubscriptionPromiseOn<Request, Result, SubscriptionMeta>
  }

  export interface SubscriptionPromiseOn<
    Request,
    Result,
    SubscriptionMeta = undefined
  > {
    (
      callback: SubscriptionPromiseCallback<Result, SubscriptionMeta>
    ): OffSubscriptionWithCatch

    request: Request
  }

  export type SubscriptionPromiseCallback<
    Result,
    SubscriptionMeta = undefined
  > = SubscriptionMeta extends undefined
    ? (result: Result) => void
    : (result: Result, meta: SubscriptionMeta) => void

  export interface Request<Kind> {
    type: 'request'
    kind: Kind
    path: string
    group?: boolean
  }

  export interface GetRequest extends Request<'get'> {
    id: string
  }

  export interface AllRequest extends Request<'all'> {}

  export interface ManyRequest extends Request<'many'> {
    ids: string
  }

  export interface QueryRequest extends Request<'many'> {
    queries: Query.Query<any>[]
  }

  export interface DocAPI<Def extends DocDef> {
    get<Props extends DocProps>(
      options?: ReadOptions<Props>
    ): SubscriptionPromise<GetRequest, VariableDoc<Def, Props> | null>

    set<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      data: SetModelArg<ResolveModelType<Def['WideModel']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    upset<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      data: SetModelArg<ResolveModelType<Def['WideModel']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    update: Update.DocFunction<Def>

    remove(): Promise<Ref<Def>>

    reduce<ReduceToModel extends ModelType>(
      fn: DocNarrowFunction<ResolveModelType<Def['WideModel']>, ReduceToModel>
    ): this is Doc<
      {
        Model: ReduceToModel
        Id: Def['Id']
        WideModel: Def['WideModel']
        Flags: Def['Flags'] & { Reduced: true }
      },
      // ReduceDef<Def, ReduceToModel, Def['Flags'] & { Reduced: true }>,
      DocProps
    >
  }

  export type DocNarrowFunction<
    InputModel extends ModelType,
    ExpectedModel extends ModelType
  > = (data: InputModel) => false | ExpectedModel

  export interface CollectionAPI<Def extends DocDef> {
    all<Props extends DocProps>(
      options?: ReadOptions<Props>
    ): SubscriptionPromise<
      AllRequest,
      Doc<Def, Props>[],
      SubscriptionListMeta<Def, Props>
    >

    query: Query.Function<Def>
  }

  /**
   *
   */
  export interface RichCollection<Def extends DocDef>
    extends CollectionAPI<Def> {
    /** The collection type */
    type: 'collection'

    /** The Firestore path */
    path: string

    get<Props extends DocProps>(
      id: Def['Id'],
      options?: ReadOptions<Props>
    ): SubscriptionPromise<GetRequest, VariableDoc<Def, Props> | null>

    many<Props extends DocProps>(
      ids: Def['Id'][],
      options?: ReadOptions<Props>
    ): SubscriptionPromise<ManyRequest, Array<Doc<Def, Props> | null>>

    add<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      data: SetModelArg<ResolveModelType<Def['Model']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    set<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      id: Def['Id'],
      data: SetModelArg<ResolveModelType<Def['WideModel']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    upset<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      id: Def['Id'],
      data: SetModelArg<ResolveModelType<Def['WideModel']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    update: Update.CollectionFunction<Def>

    remove(id: Def['Id']): Promise<Ref<Def>>

    ref(id: Def['Id']): Ref<Def>

    doc<Props extends DocProps>(
      id: Def['Id'],
      data: Def['Model']
    ): Doc<Def, Props>

    id(id: string): Def['Id']

    id(): Promise<Def['Id']>
  }

  export interface NestedRichCollection<
    Def extends DocDef,
    Schema extends AnyDB
  > extends RichCollection<Def> {
    (id: Def['Id']): Schema
    schema: Schema
  }

  export type Collection<Def extends DocDef> =
    | RichCollection<Def>
    | NestedRichCollection<Def, AnyDB>

  export interface PlainCollection<
    Model extends ModelType,
    CustomId extends Id<string> | undefined = undefined
  > {
    /** The collection type */
    type: 'collection'

    sub<Schema extends PlainSchema>(
      schema: Schema
    ): NestedPlainCollection<Model, Schema, CustomId>
  }

  export interface NestedPlainCollection<
    _Model extends ModelType,
    Schema extends PlainSchema,
    _CustomId extends Id<string> | undefined = undefined
  > {
    /** The collection type */
    type: 'collection'

    schema: Schema
  }

  export type AnyPlainCollection =
    | PlainCollection<any>
    | NestedPlainCollection<any, PlainSchema>

  export interface PlainSchema {
    [Path: string]:
      | PlainCollection<any>
      | NestedPlainCollection<any, PlainSchema>
  }

  export interface AnyDB {
    [CollectionPath: string]: Collection<any>
  }

  export type DB<Schema, BasePath extends string | undefined = undefined> = {
    [Path in keyof Schema]: Path extends string
      ? Schema[Path] extends NestedPlainCollection<
          infer Model,
          infer Schema,
          infer CustomId
        >
        ? NestedRichCollection<
            {
              Model: Model
              Id: CustomId extends Id<any>
                ? CustomId
                : Id<Utils.ComposePath<BasePath, Path>>
              WideModel: Model
              Flags: DocDefFlags
            },
            DB<Schema, Utils.ComposePath<BasePath, Path>>
          >
        : Schema[Path] extends PlainCollection<infer Model, infer CustomId>
        ? RichCollection<{
            Model: Model
            Id: CustomId extends Id<any>
              ? CustomId
              : Id<Utils.ComposePath<BasePath, Path>>
            WideModel: Model
            Flags: DocDefFlags
          }>
        : never
      : never
  }

  /**
   * Infers schema types. Useful to define function arguments that accept
   * collection doc, ref, id or data.
   */
  export type InferSchema<DB extends TypesaurusCore.DB<any, any>> = {
    /**
     * Collection types, use `["Id"]`, `["Ref"]` and `["Doc"]` to access common
     * document types.
     *
     * If the collection contains subcollections use its path to access
     * the subcollection types, i.e. `["comments"]["Id"]`.
     */
    [Path in keyof DB]: DB[Path] extends
      | RichCollection<infer Def>
      | NestedRichCollection<infer Def, any>
      ? {
          /**
           * The documents' id.
           *
           * Essentially it's a string, but TypeScript will force you to use
           * `.toString()` to cast it to `string`.
           */
          Id: Def['Id']

          /**
           * The documents' reference, contains its id and collection.
           */
          Ref: TypesaurusCore.Ref<Def>

          /**
           * The main document object, contains reference with id and collection
           * and document data.
           */
          Doc: TypesaurusCore.VariableDoc<Def, DocProps>

          /**
           * The document data
           */
          Data: ModelData<Def['Model']>

          /**
           * Read result, either doc, `null` (not found) or `undefined`
           * (the read is not finished/started yet).
           */
          Result: Doc<Def, DocProps> | null | undefined
        } & (DB[Path] extends NestedRichCollection<
          any,
          infer Schema extends TypesaurusCore.DB<any, any>
        >
          ? InferSchema<Schema>
          : {})
      : never
  }

  /**
   * Reduce doc type. If your doc has multiple shapes, the type will help you
   * reduce down data type to a specific type.
   */
  export type ReduceDoc<
    OriginalDoc extends Doc<DocDef, DocProps>,
    ReduceToModel extends ModelObjectType
  > = OriginalDoc extends Doc<
    infer Def extends DocDef,
    infer Props extends DocProps
  >
    ? ReduceToModel extends ResolveModelType<Def['Model']>
      ? Doc<
          ReduceDef<Def, ReduceToModel, Def['Flags'] & { Reduced: true }>,
          Props
        >
      : never
    : never
}
