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
      : DB[Path] extends Core.RichCollection<infer Def>
      ? Collection<Def, Environment>
      : never
  }

  export type AnyCollection<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > =
    | Collection<Def, Environment>
    | NestedCollection<Def, Schema<Environment>, Environment>

  export interface NestedCollection<
    Def extends Core.DocDef,
    NestedSchema extends Schema<Environment>,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends Collection<Def, Environment> {
    (id: Def['Id']): NestedSchema
  }

  /**
   *
   */
  export interface Collection<
    Def extends Core.DocDef,
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > extends Core.PlainCollection<Def['Model']> {
    /** The Firestore path */
    path: string

    set(id: Def['Id'], data: Core.SetModelArg<Def['Model'], Environment>): void

    upset(
      id: Def['Id'],
      data: Core.SetModelArg<Def['Model'], Environment>
    ): void

    update(
      id: Def['Id'],
      data: Update.UpdateModelArg<Def['Model'], Environment>
    ): void

    remove(id: Def['Id']): void
  }

  export interface Schema<
    Environment extends Core.RuntimeEnvironment | undefined = undefined
  > {
    [CollectionPath: string]: AnyCollection<any, Environment>
  }
}
