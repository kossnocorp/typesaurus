import type { TypesaurusCore } from './core'
import type { TypesaurusUpdate } from './update'

export namespace TypesaurusBatch {
  export interface Function {
    <
      DB extends TypesaurusCore.DB<any>,
      Environment extends
        | TypesaurusCore.RuntimeEnvironment
        | undefined = undefined
    >(
      db: DB,
      options?: TypesaurusCore.OperationOptions<Environment>
    ): RootDB<DB, Environment>
  }

  export type RootDB<
    DB extends TypesaurusCore.DB<any>,
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > = BatchDB<DB, Environment> & {
    (): Promise<void>
  }

  export type BatchDB<
    DB extends TypesaurusCore.DB<any>,
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > = {
    [Path in keyof DB]: DB[Path] extends TypesaurusCore.NestedRichCollection<
      infer Model,
      infer NestedDB
    >
      ? NestedCollection<Model, BatchDB<NestedDB, Environment>, Environment>
      : DB[Path] extends TypesaurusCore.RichCollection<infer ModelPair>
      ? Collection<ModelPair, Environment>
      : never
  }

  export type AnyCollection<
    ModelPair extends TypesaurusCore.ModelIdPair,
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > =
    | Collection<ModelPair, Environment>
    | NestedCollection<ModelPair, Schema<Environment>, Environment>

  export interface NestedCollection<
    ModelPair extends TypesaurusCore.ModelIdPair,
    NestedSchema extends Schema<Environment>,
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > extends Collection<ModelPair, Environment> {
    (id: ModelPair[1] /* Id */): NestedSchema
  }

  /**
   *
   */
  export interface Collection<
    ModelPair extends TypesaurusCore.ModelIdPair,
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > extends TypesaurusCore.PlainCollection<ModelPair[0] /* Model */> {
    /** The Firestore path */
    path: string

    set(
      id: ModelPair[1] /* Id */,
      data: TypesaurusCore.WriteModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    upset(
      id: ModelPair[1] /* Id */,
      data: TypesaurusCore.WriteModelArg<ModelPair[0] /* Model */, Environment>
    ): void

    update(
      id: ModelPair[1] /* Id */,
      data: TypesaurusUpdate.UpdateModelArg<
        ModelPair[0] /* Model */,
        Environment
      >
    ): void

    remove(id: ModelPair[1] /* Id */): void
  }

  export interface Schema<
    Environment extends
      | TypesaurusCore.RuntimeEnvironment
      | undefined = undefined
  > {
    [CollectionPath: string]: AnyCollection<any, Environment>
  }
}
