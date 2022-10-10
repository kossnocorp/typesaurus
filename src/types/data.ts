import type { TypesaurusCore as Core } from './core'

export namespace TypesaurusData {
  export interface Function {
    <
      Model extends Core.ModelObjectType,
      DateMissing extends Core.ServerDateMissing
    >(
      data: Model
    ): Core.AnyData<Model, DateMissing>
  }

  export interface SilenceFunction {
    <Result>(promise: Promise<Result>): Promise<Result | void>
  }

  export interface ResolvedFunction {
    <Doc extends Core.Doc<any, any>>(
      doc: Doc | null | undefined
    ): doc is Doc | null
  }
}
