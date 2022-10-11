import type { TypesaurusUtils as Utils } from './utils'
import type { TypesaurusQuery as Query } from './query'
import type { TypesaurusUpdate as Update } from './update'
import type { TypesaurusFirebase as Firebase } from './firebase'

export namespace TypesaurusCore {
  export interface Function {
    <Schema extends PlainSchema>(
      getSchema: ($: SchemaHelpers) => Schema
    ): DB<Schema>
  }

  /**
   * Define custom id passing the collection path string as the generic.
   */
  export type Id<Path extends string> = string & {
    __dontUseWillBeUndefined__: Path
  }

  export type ModelType = ModelObjectType | ModelVariableType

  export type ModelVariableType =
    | [ModelObjectType]
    | [ModelObjectType, ModelObjectType]
    | [ModelObjectType, ModelObjectType, ModelObjectType]
    | [ModelObjectType, ModelObjectType, ModelObjectType, ModelObjectType]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType
      ]

  export type ModelObjectType = object & { length?: never }

  export type DocModel<Def extends DocDef> =
    Def['Flags']['Reduced'] extends true
      ? ResolveModelType<Def['Model']>
      : SharedModelType<Def['WideModel']>

  export type ResolveModelType<Model extends ModelType> = Model extends [
    infer A extends ModelObjectType,
    infer B extends ModelObjectType,
    infer C extends ModelObjectType,
    infer D extends ModelObjectType,
    infer E extends ModelObjectType,
    infer F extends ModelObjectType,
    infer G extends ModelObjectType,
    infer H extends ModelObjectType,
    infer I extends ModelObjectType,
    infer J extends ModelObjectType
  ]
    ? Utils.Variable<A, B, C, D, E, F, G, H, I, J>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType,
        infer F extends ModelObjectType,
        infer G extends ModelObjectType,
        infer H extends ModelObjectType,
        infer I extends ModelObjectType
      ]
    ? Utils.Variable<A, B, C, D, E, F, G, H, I>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType,
        infer F extends ModelObjectType,
        infer G extends ModelObjectType,
        infer H extends ModelObjectType
      ]
    ? Utils.Variable<A, B, C, D, E, F, G, H>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType,
        infer F extends ModelObjectType,
        infer G extends ModelObjectType
      ]
    ? Utils.Variable<A, B, C, D, E, F, G>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType,
        infer F extends ModelObjectType
      ]
    ? Utils.Variable<A, B, C, D, E, F>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType
      ]
    ? Utils.Variable<A, B, C, D, E>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType
      ]
    ? Utils.Variable<A, B, C, D>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType
      ]
    ? Utils.Variable<A, B, C>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType
      ]
    ? Utils.Variable<A, B>
    : Model extends [infer A extends ModelObjectType]
    ? A
    : Model extends ModelObjectType
    ? Model
    : never

  export type SharedModelType<Model extends ModelType> = Model extends [
    infer A extends ModelObjectType,
    infer B extends ModelObjectType,
    infer C extends ModelObjectType,
    infer D extends ModelObjectType,
    infer E extends ModelObjectType,
    infer F extends ModelObjectType,
    infer G extends ModelObjectType,
    infer H extends ModelObjectType,
    infer I extends ModelObjectType,
    infer J extends ModelObjectType
  ]
    ? Utils.SharedShape10<A, B, C, D, E, F, G, H, I, J>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType,
        infer F extends ModelObjectType,
        infer G extends ModelObjectType,
        infer H extends ModelObjectType,
        infer I extends ModelObjectType
      ]
    ? Utils.SharedShape9<A, B, C, D, E, F, G, H, I>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType,
        infer F extends ModelObjectType,
        infer G extends ModelObjectType,
        infer H extends ModelObjectType
      ]
    ? Utils.SharedShape8<A, B, C, D, E, F, G, H>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType,
        infer F extends ModelObjectType,
        infer G extends ModelObjectType
      ]
    ? Utils.SharedShape7<A, B, C, D, E, F, G>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType,
        infer F extends ModelObjectType
      ]
    ? Utils.SharedShape6<A, B, C, D, E, F>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType,
        infer E extends ModelObjectType
      ]
    ? Utils.SharedShape5<A, B, C, D, E>
    : Model extends [
        infer A extends ModelObjectType,
        infer B extends ModelObjectType,
        infer C extends ModelObjectType,
        infer D extends ModelObjectType
      ]
    ? Utils.SharedShape4<A, B, C, D>
    : Model extends [
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
    : Model extends [infer A extends ModelObjectType]
    ? A
    : Model extends ModelObjectType
    ? Model
    : never

  /**
   * Concats models into single variable model type. Useful to define and export
   * variable models ouside of the centraliazed schema definition.
   */
  export type ConcatModel<
    ModelToConcatTo extends ModelType,
    ModelToConcat extends ModelType
  > = ModelToConcatTo extends ModelObjectType
    ? ModelToConcat extends ModelObjectType
      ? [ModelToConcatTo, ModelToConcat]
      : ModelToConcat extends ModelVariableType
      ? [ModelToConcatTo, ...ModelToConcat]
      : never
    : ModelToConcatTo extends ModelVariableType
    ? ModelToConcat extends ModelObjectType
      ? [...ModelToConcatTo, ModelToConcat]
      : ModelToConcat extends ModelVariableType
      ? [...ModelToConcatTo, ...ModelToConcat]
      : never
    : never

  export interface DocDefFlags {
    Reduced: boolean
  }

  export interface DocDef {
    Model: ModelType
    Id: Id<string> | string
    /**
     * If the collection has variable shape, it will contain models tuple,
     * otherwise it will be equal {@link Model}.
     */
    WideModel: ModelType
    Flags: DocDefFlags
  }

  export interface DocProps {
    readonly environment: RuntimeEnvironment
    readonly source: DataSource
    readonly dateStrategy: ServerDateStrategy
    readonly pendingWrites: boolean
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

  export interface ReadOptions<
    Environment extends RuntimeEnvironment,
    Props extends DocProps & { environment: Environment }
  > extends DocOptions<Props>,
      OperationOptions<Environment> {}

  export type NarrowDef<
    Def extends DocDef,
    ReduceToModel,
    Flags = Def['Flags']
  > = {
    Model: ReduceToModel
    Id: Def['Id']
    WideModel: Def['WideModel']
    Flags: Flags
  }

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export interface Doc<Def extends DocDef, Props extends DocProps>
    extends DocAPI<Def> {
    type: 'doc'

    ref: Ref<Def>

    data: Props['environment'] extends 'server'
      ? ServerData<ResolveModelType<Def['Model']>>
      : Props['source'] extends 'database'
      ? Data<ResolveModelType<Def['Model']>, 'present'>
      : Props['dateStrategy'] extends 'estimate' | 'previous'
      ? Data<ResolveModelType<Def['Model']>, 'present'>
      : Data<ResolveModelType<Def['Model']>, 'missing'>

    readonly props: Props

    test<Props extends Partial<DocProps>>(
      props: Props
    ): this is Doc<Def, DocProps & Props>

    assert<Props extends Partial<DocProps>>(
      props: Props
    ): asserts this is Doc<Def, DocProps & Props>
  }

  export type ServerData<Model extends ModelObjectType> = Data<Model, 'present'>

  export type AnyData<Model extends ModelObjectType> = Data<
    Model,
    ServerDateMissing
  >

  export type Data<
    Model extends ModelObjectType,
    DateMissing extends ServerDateMissing
  > = {
    [Key in keyof Model]: DataField<Model[Key], DateMissing>
  }

  export type DataField<
    Field,
    DateMissing extends ServerDateMissing
  > = Field extends ServerDate // Process server dates
    ? DateMissing extends 'missing'
      ? Date | null
      : Date
    : Field extends Ref<any> | Date | Id<string> // Stop refs, dates and ids from being processed as an object
    ? Field
    : Field extends Array<infer ItemType>
    ? Array<DataField<ItemType, DateMissing>>
    : Field extends object // If it's an object, recursively pass through ModelData
    ? Data<Field, DateMissing>
    : Field

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

  export type ServerDateMissing = 'missing' | 'present'

  export type ServerDateStrategy = 'estimate' | 'previous' | 'none'

  export type RuntimeEnvironment = 'server' | 'client'

  export type DataSource = 'cache' | 'database'

  export interface ServerDate extends Date {
    __dontUseWillBeUndefined__: true
  }

  export type WriteArg<Model extends ModelObjectType, Props extends DocProps> =
    | WriteData<Model, Props>
    | WriteGetter<Model, Props>

  /**
   * Write model getter, accepts helper functions with special value generators
   * and returns {@link WriteData}.
   */
  export type WriteGetter<
    Model extends ModelObjectType,
    Props extends DocProps
  > = ($: WriteHelpers<Model>) => WriteData<Model, Props>

  export interface WriteHelpers<_Model> {
    serverDate(): ValueServerDate

    remove(): ValueRemove

    increment(value: number): ValueIncrement

    arrayUnion<Type>(values: Type | Type[]): ValueArrayUnion<Type>

    arrayRemove<Type>(values: Type | Type[]): ValueArrayRemove<Type>
  }

  /**
   * Type of the data passed to write functions. It extends the model allowing
   * to set special values, sucha as server date, increment, etc.
   */
  export type WriteData<Model, Props extends DocProps> = {
    [Key in keyof Model]: WriteField<Model, Key, Props>
  }

  export type WriteField<
    Data,
    Key extends keyof Data,
    Props extends DocProps
  > = Exclude<Data[Key], undefined> extends infer Type // Exclude undefined
    ? Type extends ServerDate // First, ensure ServerDate is properly set
      ? WriteFieldMaybeUndefined<
          Data[Key],
          WriteFieldServerDate<Data, Key, Props>
        >
      : Type extends Array<infer ItemType>
      ? WriteFieldMaybeUndefined<
          Data[Key],
          WriteFieldArray<Data, Key, ItemType>
        >
      : Type extends object // If it's an object, recursively pass through SetModel
      ? WriteFieldMaybeUndefined<Data[Key], WriteFieldObject<Data, Key, Props>>
      : Type extends number
      ? WriteFieldMaybeUndefined<Data[Key], WriteFieldNumber<Data, Key>>
      : WriteFieldMaybeUndefined<Data[Key], WriteFieldOther<Data, Key>>
    : never

  export type WriteFieldMaybeUndefined<
    OriginType,
    Value = OriginType
  > = OriginType extends undefined ? Value | undefined : Value

  export type WriteFieldServerDate<
    Model,
    Key extends keyof Model,
    Props extends DocProps
  > = Props['environment'] extends 'server' // Date can be used only in the server environment
    ? Date | ValueServerDate | MaybeValueRemove<Model, Key>
    : ValueServerDate | MaybeValueRemove<Model, Key>

  export type WriteFieldArray<Model, Key extends keyof Model, ItemType> =
    | WriteArray<Array<ItemType>>
    | ValueArrayUnion<
        WriteFieldMaybeUndefined<ItemType, WriteArrayItem<ItemType>>
      >
    | ValueArrayRemove<
        WriteFieldMaybeUndefined<ItemType, WriteArrayItem<ItemType>>
      >
    | MaybeValueRemove<Model, Key>

  export type WriteArray<Data extends Array<any>> = Data extends Array<
    infer ItemType
  >
    ? Array<WriteArrayItem<ItemType>>
    : never

  export type WriteArrayItem<Item> = Item extends ServerDate | Array<any> // No server dates and arrays are allowed in arrays
    ? never
    : Item extends Ref<any> | Date | Id<string> // Stop refs, dates and ids from being processed as an object
    ? Item
    : Item extends object // If it's an object, recursively pass through WriteArrayObject
    ? WriteArrayObject<Item>
    : Item

  export type WriteArrayObject<Data extends object & { length?: never }> = {
    [Key in keyof Data]: WriteArrayObjectField<Data[Key]>
  }

  export type WriteArrayObjectField<Field> = Field extends ServerDate // No server dates are allowed in arrays
    ? never
    : Field extends Ref<any> | Date | Id<string> // Stop refs, dates and ids from being processed as an object
    ? Field
    : Field extends Array<any>
    ? WriteArray<Field>
    : Field extends object // If it's an object, recursively pass through ModelData
    ? WriteArrayObject<Field>
    : Field

  export type WriteFieldNumber<Model, Key extends keyof Model> =
    | Model[Key]
    | ValueIncrement
    | MaybeValueRemove<Model, Key>

  export type WriteFieldOther<Model, Key extends keyof Model> =
    | Model[Key]
    | MaybeValueRemove<Model, Key>

  export type WriteFieldObject<
    Model,
    Key extends keyof Model,
    Props extends DocProps
  > =
    | WriteData<Model[Key], Props> // Even for update, nested objects are passed to set model
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

  export interface SchemaHelpers {
    collection<
      Model extends ModelType,
      CustomId extends Id<string> | string | undefined = undefined
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
    get<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      options?: ReadOptions<Environment, Props>
    ): SubscriptionPromise<GetRequest, Doc<Def, Props> | null>

    set<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      data: WriteArg<ResolveModelType<Def['WideModel']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    upset<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      data: WriteArg<ResolveModelType<Def['WideModel']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    update: Update.DocFunction<Def>

    remove(): Promise<Ref<Def>>

    narrow<NarrowToModel extends ModelType>(
      fn: DocNarrowFunction<ResolveModelType<Def['WideModel']>, NarrowToModel>
    ):
      | Doc<
          {
            Model: NarrowToModel
            Id: Def['Id']
            WideModel: Def['WideModel']
            Flags: Def['Flags'] & { Reduced: true }
          },
          DocProps
        >
      | undefined
  }

  export type DocNarrowFunction<
    InputModel extends ModelType,
    ExpectedModel extends ModelType
  > = (data: InputModel) => false | ExpectedModel

  export interface CollectionAPI<Def extends DocDef> {
    all<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      options?: ReadOptions<Environment, Props>
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

    get<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      id: Def['Id'],
      options?: ReadOptions<Environment, Props>
    ): SubscriptionPromise<GetRequest, Doc<Def, Props> | null>

    many<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      ids: Def['Id'][],
      options?: ReadOptions<Environment, Props>
    ): SubscriptionPromise<ManyRequest, Array<Doc<Def, Props> | null>>

    add<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      data: WriteArg<ResolveModelType<Def['Model']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    set<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      id: Def['Id'],
      data: WriteArg<ResolveModelType<Def['WideModel']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    upset<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment }
    >(
      id: Def['Id'],
      data: WriteArg<ResolveModelType<Def['WideModel']>, Props>,
      options?: OperationOptions<Environment>
    ): Promise<Ref<Def>>

    update: Update.CollectionFunction<Def>

    remove(id: Def['Id']): Promise<Ref<Def>>

    ref(id: Def['Id']): Ref<Def>

    doc<Props extends DocProps>(snapshot: Firebase.Snapshot): Doc<Def, Props>

    doc<Props extends DocProps>(
      id: Def['Id'],
      data: ResolveModelType<Def['WideModel']>
    ): Doc<Def, Props>

    /**
     * Cast a string to typed document id.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @param id - the string to cast to the typed document id
     * @returns typed document id
     *
     * @example
     * const commentId = db.comments.id('t2nNOgoQY8a5vcvWl1yAz26Ue7k2')
     */
    id(id: string): Def['Id']

    /**
     * Generate random document id using Firebase.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @returns promise to random typed document id
     *
     * @example
     * const newCommentId = await db.comments.id()
     */
    id(): Promise<Def['Id']>

    configure(config: CollectionConfig): void
  }

  export interface CollectionConfig {
    path?: string
  }

  export interface NestedRichCollection<
    Def extends DocDef,
    Schema extends AnyDB
  > extends RichCollection<Def> {
    (id: Def['Id']): Schema

    schema: Schema

    sub: NestedCollectionShortcuts<Schema>
  }

  export type NestedCollectionShortcuts<Schema extends AnyDB> = {
    [Path in keyof Schema]: Path extends string
      ? Schema[Path] extends NestedRichCollection<infer Def, infer Schema>
        ? NestedCollectionShortcut<Def, Schema>
        : Schema[Path] extends RichCollection<infer Def>
        ? CollectionShortcut<Def>
        : Schema[Path]
      : never
  }

  export interface CollectionShortcut<Def extends DocDef> {
    /**
     * Cast a string to typed document id.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @param id - the string to cast to the typed document id
     * @returns typed document id
     *
     * @example
     * const commentId = db.posts.sub.comments.id('t2nNOgoQY8a5vcvWl1yAz26Ue7k2')
     */
    id(id: string): Def['Id']

    /**
     * Generate random document id using Firebase.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @returns promise to random typed document id
     *
     * @example
     * const newCommentId = await db.posts.sub.comments.id()
     */
    id(): Promise<Def['Id']>
  }

  export interface NestedCollectionShortcut<
    Def extends DocDef,
    Schema extends AnyDB
  > extends CollectionShortcut<Def> {
    sub: NestedCollectionShortcuts<Schema>
  }

  export type Collection<Def extends DocDef> =
    | RichCollection<Def>
    | NestedRichCollection<Def, AnyDB>

  export interface PlainCollection<
    Model extends ModelType,
    CustomId extends Id<string> | string | undefined = undefined
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
    _CustomId extends Id<string> | string | undefined = undefined
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
              Id: CustomId extends Id<any> | string
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
            Id: CustomId extends Id<any> | string
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
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#sub).
           */
          sub: DB[Path] extends NestedRichCollection<
            any,
            infer Schema extends TypesaurusCore.DB<any, any>
          >
            ? InferSchema<Schema>
            : never

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#def).
           */
          Def: Def

          /**
           * The documents' id.
           *
           * Essentially it's a string, but TypeScript will force you to use
           * `.toString()` to cast it to `string`.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#id).
           */
          Id: Def['Id']

          /**
           * The documents' reference, contains its id and collection.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#ref).
           */
          Ref: TypesaurusCore.Ref<Def>

          /**
           * The main document object, contains reference with id and collection
           * and document data.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#doc).
           */
          Doc: TypesaurusCore.Doc<Def, DocProps>

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#model).
           */
          Model: ResolveModelType<Def['Model']>

          /**
           * The document data. It differs from the interface used to define
           * the collection by Firestore nuances such as undefined turned into
           * nulls, and nullable dates. A variable model is also resolved.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#data).
           */
          Data: AnyData<ResolveModelType<Def['Model']>>

          /**
           * Read result, either doc, `null` (not found) or `undefined`
           * (the read is not finished/started yet).
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#result).
           */
          Result: Doc<Def, DocProps> | null | undefined

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-arg).
           */
          WriteArg: WriteArg<ResolveModelType<Def['Model']>, DocProps>

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-data).
           */
          WriteData: WriteData<ResolveModelType<Def['Model']>, DocProps>

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-getter).
           */
          WriteGetter: WriteGetter<ResolveModelType<Def['Model']>, DocProps>

          /**
           * Write helpers type allows to abstract write building (for add, set
           * and upset methods) login into functions by accepting it as
           * an argument.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#write-helpers).
           */
          WriteHelpers: WriteHelpers<Def['Model']>

          /**
           * Update builder type allows to abstract update building login into
           * functions by accepting it as an argument.
           *
           * Unlike UpdateHelpers, UpdateBuilder can be used asynchronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-builder).
           */
          UpdateBuilder: Update.Builder<Def, DocProps>

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-arg).
           */
          UpdateArg: Update.Arg<ResolveModelType<Def['Model']>, DocProps>

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-data).
           */
          UpdateData: Update.Data<ResolveModelType<Def['Model']>, DocProps>

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-getter).
           */
          UpdateGetter: Update.Getter<ResolveModelType<Def['Model']>, DocProps>

          /**
           * Update helpers type allows to abstract update building login into
           * functions by accepting it as an argument.
           *
           * Unlike UpdateBuilder, UpdateHelpers must be used syncronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#update-helpers).
           */
          UpdateHelpers: Update.Helpers<Def, DocProps>

          /**
           * Query builder type allows to abstract query building login into
           * functions by accepting it as an argument.
           *
           * Unlike QueryHelpers, QueryBuilder can be used asynchronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#query-builder).
           */
          QueryBuilder: Query.Builder<Def, DocProps>

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#query-data).
           */
          QueryData: Query.Data<Def>

          /**
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#query-getter).
           */
          QueryGetter: Query.Getter<Def>

          /**
           * Query helpers type allows to abstract query building login into
           * functions by accepting it as an argument.
           *
           * Unlike QueryBuilder, QueryHelpers must be used syncronously.
           *
           * [Learn more on the docs website](https://typesaurus.com/docs/api/type/schema#query-helpers).
           */
          QueryHelpers: Query.Helpers<Def>
        }
      : never
  }

  /**
   * Narrow doc type. If your doc has multiple shapes, the type will help you
   * narrow down data type to a specific type.
   */
  export type NarrowDoc<
    OriginalDoc extends Doc<any, any>,
    NarrowToModel extends ModelObjectType
  > = OriginalDoc extends Doc<
    infer Def extends DocDef,
    infer Props extends DocProps
  >
    ? NarrowToModel extends ResolveModelType<Def['WideModel']>
      ? Doc<
          {
            Model: NarrowToModel
            Id: Def['Id']
            WideModel: Def['WideModel']
            Flags: Def['Flags'] & { Reduced: true }
          },
          Props
        >
      : never
    : never
}
