import type { TypesaurusCore as Core } from './core'

export namespace TypesaurusHelpers {
  export interface RetryOptions {
    pattern?: number[]
    bypass?: boolean
  }

  export interface RetryFunction {
    <Request, Result, SubscriptionMeta = undefined>(
      on: Core.SubscriptionPromiseOn<Request, Result, SubscriptionMeta>,
      options?: RetryOptions
    ): Core.SubscriptionPromiseOn<Request, Result, SubscriptionMeta>
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
