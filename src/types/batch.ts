import type { TypesaurusCore as Core } from './core.js'
import type { TypesaurusUpdate as Update } from './update.js'

export namespace TypesaurusBatch {
  export interface Function {
    <
      DB extends Core.DB<any>,
      Environment extends Core.RuntimeEnvironment,
      Props extends Core.DocProps & { environment: Environment }
    >(
      db: DB,
      options?: Core.OperationOptions<Environment>
    ): RootDB<DB, Props>
  }

  export type RootDB<
    DB extends Core.DB<any>,
    Props extends Core.DocProps
  > = BatchDB<DB, Props> & {
    (): Promise<void>
  }

  export type BatchDB<DB extends Core.DB<any>, Props extends Core.DocProps> = {
    [Path in keyof DB]: DB[Path] extends Core.NestedCollection<
      infer Model,
      infer NestedDB
    >
      ? NestedCollection<Model, Props, BatchDB<NestedDB, Props>>
      : DB[Path] extends Core.Collection<infer Def>
      ? Collection<Def, Props>
      : never
  }

  export type AnyCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > = Collection<Def, Props> | NestedCollection<Def, Props, Schema<Props>>

  export interface NestedCollection<
    Def extends Core.DocDef,
    Props extends Core.DocProps,
    NestedSchema extends Schema<Props>
  > extends Collection<Def, Props> {
    (id: Def['Id']): NestedSchema
  }

  /**
   *
   */
  export interface Collection<
    Def extends Core.DocDef,
    Props extends Core.DocProps
  > extends Core.PlainCollection<Def['Model']> {
    /** The Firestore path */
    path: string

    set(
      id: Def['Id'],
      data: Core.WriteArg<Core.IntersectVariableModelType<Def['Model']>, Props>
    ): void

    upset(
      id: Def['Id'],
      data: Core.WriteArg<Core.IntersectVariableModelType<Def['Model']>, Props>
    ): void

    update(
      id: Def['Id'],
      data: Update.Arg<Core.SharedVariableModelType<Def['WideModel']>, Props>
    ): void

    remove(id: Def['Id']): void
  }

  export interface Schema<Props extends Core.DocProps> {
    [CollectionPath: string]: AnyCollection<any, Props>
  }
}
