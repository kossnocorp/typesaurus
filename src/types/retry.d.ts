import { TypesaurusCore as Core } from './core'

export namespace TypesaurusRetry {
  export interface Function {
    <Request, Result, SubscriptionMeta = undefined>(
      on: Core.SubscriptionPromiseOn<Request, Result, SubscriptionMeta>,
      retry?: number[]
    ): Core.SubscriptionPromiseOn<Request, Result, SubscriptionMeta>
  }
}
