import type { Typesaurus } from '..'

export namespace TypesaurusBatch {
  export interface Function {
    <
      Schema extends Typesaurus.PlainSchema,
      Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
    >(
      db: Typesaurus.RootDB<Schema>,
      options?: Typesaurus.OperationOptions<Environment>
    ): RootDB<Schema, Environment>
  }

  export type RootDB<
    Schema extends Typesaurus.PlainSchema,
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > = DB<Schema, Environment> & {
    commit: () => Promise<void>
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
    (id: string): NestedSchema
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

    set(id: string, data: Typesaurus.WriteModelArg<Model, Environment>): void

    upset(id: string, data: Typesaurus.WriteModelArg<Model, Environment>): void

    update(
      id: string,
      data: Typesaurus.UpdateModelArg<Model, Environment>
    ): void

    remove(id: string): void
  }

  export interface Schema<
    Environment extends Typesaurus.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyCollection<unknown, Environment>
  }
}
