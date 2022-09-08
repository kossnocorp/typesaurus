import type { TypesaurusCore as Core } from './core'
import type { TypesaurusUpdate as Update } from './update'

export namespace TypesaurusBatch {
  export interface Function {
    <
      DB extends Core.DB<any>,
      Environment extends Core.RuntimeEnvironment | undefined = undefined
    >(
      db: DB,
      options?: Core.OperationOptions<Environment>
    ): RootDB<DB, Environment>
  }

  export type RootDB<
    DB extends Core.DB<any>,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = BatchDB<DB, Environment> & {
    (): Promise<void>
  }

  export type BatchDB<
    DB extends Core.DB<any>,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > = {
    [Path in keyof DB]: DB[Path] extends Core.NestedRichCollection<
      infer Model,
      infer NestedDB
    >
      ? NestedCollection<Model, BatchDB<NestedDB, Environment>, Environment>
      : DB[Path] extends Core.RichCollection<infer ModelPair>
      ? Collection<ModelPair, Environment>
      : never
  }

  export type AnyCollection<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > =
    | Collection<ModelPair, Environment>
    | NestedCollection<ModelPair, Schema<Environment>, Environment>

  export interface NestedCollection<
    ModelPair extends Core.ModelIdPair,
    NestedSchema extends Schema<Environment>,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends Collection<ModelPair, Environment> {
    (id: ModelPair[1]): NestedSchema
  }

  /**
   *
   */
  export interface Collection<
    ModelPair extends Core.ModelIdPair,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends Core.PlainCollection<ModelPair[0]> {
    /** The Firestore path */
    path: string

    set(
      id: ModelPair[1],
      data: Core.SetModelArg<ModelPair[0], Environment>
    ): void

    upset(
      id: ModelPair[1],
      data: Core.SetModelArg<ModelPair[0], Environment>
    ): void

    update(
      id: ModelPair[1],
      data: Update.UpdateModelArg<ModelPair[0], Environment>
    ): void

    remove(id: ModelPair[1]): void
  }

  export interface Schema<
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyCollection<any, Environment>
  }
}
