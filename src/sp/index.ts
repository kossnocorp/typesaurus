import type { TypesaurusCore } from "../types/core.js";

export type SubscriptionPromiseGet<Result> = () => Promise<Result>;

export type SubscriptionPromiseResultCallback<Result, SubscriptionMeta> =
  SubscriptionMeta extends undefined
    ? (result: Result) => void
    : (result: Result, meta: SubscriptionMeta) => void;

export type SubscriptionPromiseErrorCallback = (error: Error) => void;

export type SubscriptionPromiseSubscribe<Result, SubscriptionMeta> = (
  resultCallback: SubscriptionPromiseResultCallback<Result, SubscriptionMeta>,
  errorCallback: SubscriptionPromiseErrorCallback,
) => TypesaurusCore.OffSubscription;

export interface SubscriptionPromiseProps<Request, Result, SubscriptionMeta> {
  request: Request;
  get: SubscriptionPromiseGet<Result>;
  subscribe: SubscriptionPromiseSubscribe<Result, SubscriptionMeta>;
}

export interface SubscriptionPromiseSubscriptions<Result, SubscriptionMeta> {
  result: SubscriptionPromiseResultCallback<Result, SubscriptionMeta>[];
  error: SubscriptionPromiseErrorCallback[];
}

export class SubscriptionPromise<Request, Result, SubscriptionMeta = undefined>
  implements TypesaurusCore.SubscriptionPromise<Request, Result>
{
  private result: Result | undefined;

  private subscriptionMeta: SubscriptionMeta | undefined;

  private error: unknown;

  private get: SubscriptionPromiseGet<Result>;

  private subscribe: SubscriptionPromiseSubscribe<Result, SubscriptionMeta>;

  private promise: Promise<Result> | undefined;

  private off: (() => void) | undefined;

  private subscriptions: SubscriptionPromiseSubscriptions<
    Result,
    SubscriptionMeta
  >;

  request: Request;

  constructor({
    request,
    get,
    subscribe,
  }: SubscriptionPromiseProps<Request, Result, SubscriptionMeta>) {
    this.request = request;
    this.get = get;
    this.subscribe = subscribe;
    this.subscriptions = { result: [], error: [] };
    // Bind on, so it can be used as a value
    this.on = this.on.bind(this);
    // @ts-ignore
    this.on.request = request;
  }

  get [Symbol.toStringTag]() {
    return "[object SubscriptionPromise]";
  }

  then<FullfillResult = Result, RejectResult = never>(
    onFulfilled?:
      | ((value: Result) => FullfillResult | PromiseLike<FullfillResult>)
      | undefined
      | null,
    onRejected?:
      | ((reason: any) => RejectResult | PromiseLike<RejectResult>)
      | undefined
      | null,
  ): Promise<FullfillResult | RejectResult> {
    return this.resolve().then(onFulfilled, onRejected);
  }

  catch<CatchResult = never>(
    onRejected?:
      | ((reason: any) => CatchResult | PromiseLike<CatchResult>)
      | undefined
      | null,
  ): Promise<Result | CatchResult> {
    return this.resolve().catch(onRejected);
  }

  finally(onFinally?: (() => void) | null | undefined): Promise<Result> {
    return this.resolve().finally(onFinally);
  }

  // @ts-ignore: TODO: fix this
  on(
    callback: TypesaurusCore.SubscriptionPromiseCallback<
      Result,
      SubscriptionMeta
    >,
  ): TypesaurusCore.OffSubscriptionWithCatch {
    if (this.promise) throw new Error("Can't subscribe after awaiting");

    this.subscriptions.result.push(callback);

    if (this.off) {
      // @ts-ignore: TODO: fix this
      if (this.result) callback(this.result, this.subscriptionMeta);
    } else {
      this.off = this.subscribe(
        // @ts-ignore: TODO: fix this
        (result, meta) => {
          this.result = result;
          this.subscriptionMeta = meta;
          this.subscriptions.result.forEach((callback) =>
            callback(result, meta),
          );
        },
        (error) => {
          this.error = error;
          this.subscriptions.error.forEach((callback) => callback(error));
        },
      );
    }

    const off = () => {
      const index = this.subscriptions.result.indexOf(callback);
      if (index !== -1) this.subscriptions.result.splice(index, 1);

      // If no more subscriptions, unsubscribe and clean up results
      if (
        !this.subscriptions.result.length &&
        !this.subscriptions.error.length
      ) {
        this.off?.();
        this.off = undefined;
        this.result = undefined;
        this.subscriptionMeta = undefined;
        this.error = undefined;
      }
    };

    const offWithCatch = (() => {
      off();
    }) as TypesaurusCore.OffSubscriptionWithCatch;

    offWithCatch.catch = (errorCallback) => {
      if (this.error) errorCallback(this.error);
      this.subscriptions.error.push(errorCallback);

      return () => {
        const index = this.subscriptions.error.indexOf(errorCallback);
        if (index !== -1) this.subscriptions.error.splice(index, 1);

        off();
      };
    };

    return offWithCatch;
  }

  private resolve() {
    if (this.off)
      return Promise.reject(new Error("Can't await after subscribing"));

    if (this.result) return Promise.resolve(this.result);
    if (this.error) return Promise.reject(this.error);
    if (this.promise) return this.promise;

    try {
      this.promise = this.get()
        .then((result) => {
          this.result = result;
          return result;
        })
        .catch((error) => {
          this.error = error;
          throw error;
        });
      return this.promise;
    } catch (error) {
      this.error = error;
      return Promise.reject(error);
    }
  }
}
