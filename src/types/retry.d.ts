import { TypesaurusCore as Core } from './core'

export namespace TypesaurusRetry {
  export interface Options {
    pattern?: number[]
    bypass?: boolean
  }

  export interface Function {
    <Request, Result, SubscriptionMeta = undefined>(
      on: Core.SubscriptionPromiseOn<Request, Result, SubscriptionMeta>,
      options?: Options
    ): Core.SubscriptionPromiseOn<Request, Result, SubscriptionMeta>
  }
}
