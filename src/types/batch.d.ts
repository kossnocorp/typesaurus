import type { Typesaurus } from '..'

export namespace TypesaurusBatch {
  export interface Function {
    <
      Schema extends Typesaurus.PlainSchema,
      Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
    >(
      db: Typesaurus.DB<Schema>,
      options?: Typesaurus.OperationOptions<Environment>
    ): RootDB<Schema, Environment>
  }

  export type RootDB<
    Schema extends Typesaurus.PlainSchema,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = DB<Schema, Environment> & {
    (): Promise<void>
  }

  export type DB<
    Schema extends Typesaurus.PlainSchema,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = {
    [Path in keyof Schema]: Schema[Path] extends Typesaurus.NestedPlainCollection<
      infer Model,
      infer Schema
    >
      ? NestedCollection<Model, DB<Schema, Environment>, Environment>
      : Schema[Path] extends Typesaurus.PlainCollection<infer Model>
      ? Collection<Model, Environment>
      : never
  }

  export type AnyCollection<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > =
    | Collection<Model, Environment>
    | NestedCollection<Model, Schema<Environment>, Environment>

  export interface NestedCollection<
    Model,
    NestedSchema extends Schema<Environment>,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends Collection<Model, Environment> {
    (id: Typesaurus.Id<Model>): NestedSchema
  }

  /**
   *
   */
  export interface Collection<
    Model,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > extends Typesaurus.PlainCollection<Model> {
    /** The Firestore path */
    path: string

    set(
      id: Typesaurus.Id<Model>,
      data: Typesaurus.WriteModelArg<Model, Environment>
    ): void

    upset(
      id: Typesaurus.Id<Model>,
      data: Typesaurus.WriteModelArg<Model, Environment>
    ): void

    update(
      id: Typesaurus.Id<Model>,
      data: Typesaurus.UpdateModelArg<Model, Environment>
    ): void

    remove(id: Typesaurus.Id<Model>): void
  }

  export interface Schema<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyCollection<unknown, Environment>
  }
}
