export namespace TypesaurusHelpers {
  export interface SilenceFunction {
    <Result>(promise: Promise<Result>): Promise<Result | void>
  }
}
