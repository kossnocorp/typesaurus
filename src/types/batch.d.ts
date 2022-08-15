import type { Typesaurus } from '..'

export namespace TypesaurusBatch {
  export interface Function {
    <
      DB extends Typesaurus.DB<any>,
      Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
    >(
      db: DB,
      options?: Typesaurus.OperationOptions<Environment>
    ): RootDB<DB, Environment>
  }

  export type RootDB<
    DB extends Typesaurus.DB<any>,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = BatchDB<DB, Environment> & {
    (): Promise<void>
  }

  export type BatchDB<
    DB extends Typesaurus.DB<any>,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = {
    [Path in keyof DB]: DB[Path] extends Typesaurus.NestedRichCollection<
      infer Model,
      infer NestedDB
    >
      ? NestedCollection<Model, BatchDB<NestedDB, Environment>, Environment>
      : DB[Path] extends Typesaurus.RichCollection<infer ModelPair>
      ? Collection<ModelPair, Environment>
      : never
  }

  export type AnyCollection<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > =
    | Collection<ModelPair, Environment>
    | NestedCollection<ModelPair, Schema<Environment>, Environment>

  export interface NestedCollection<
    ModelPair extends Typesaurus.ModelPathPair,
    NestedSchema extends Schema<Environment>,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends Collection<ModelPair, Environment> {
    (id: Typesaurus.Id<ModelPair[1] /* Path */>): NestedSchema
  }

  /**
   *
   */
  export interface Collection<
    ModelPair extends Typesaurus.ModelPathPair,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends Typesaurus.PlainCollection<ModelPair[0] /* Model */> {
    /** The Firestore path */
    path: string

    set(
      id: Typesaurus.Id<ModelPair[1] /* Path */>,
      data: Typesaurus.WriteModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    upset(
      id: Typesaurus.Id<ModelPair[1] /* Path */>,
      data: Typesaurus.WriteModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    update(
      id: Typesaurus.Id<ModelPair[1] /* Path */>,
      data: Typesaurus.UpdateModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    remove(id: Typesaurus.Id<ModelPair[1] /* Path */>): void
  }

  export interface Schema<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyCollection<any, Environment>
  }
}
