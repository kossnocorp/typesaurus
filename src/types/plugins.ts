import { SubscriptionPromise } from "../sp";
import { TypesaurusCore as Core } from "./core";

export namespace TypesaurusPlugins {
  export interface Plugin {
    sp?: SubscriptionPromise.Plugin;
  }

  export namespace SubscriptionPromise {
    export type Plug<
      Request,
      Result,
      Meta,
      Plugin_ extends Plugin | undefined,
    > = Core.SubscriptionPromise<Request, Result, Meta> &
      (Plugin_ extends (
        sp: Core.SubscriptionPromise<Request, Result, Meta>,
      ) => infer Methods
        ? Methods
        : {});

    export type Plugin = <Request, Result, Meta>(
      sp: Core.SubscriptionPromise<Request, Result, Meta>,
    ) => any;

    // export type Methods = Record<string, any>;
  }

  // export type SubscriptionPromiseInit = Record<
  //   string,
  //   SubscriptionPromiseMethodInit
  // >;

  // export type SubscriptionPromisePlugin<
  //   Init_ extends SubscriptionPromisePlugin<any> | undefined,
  // > = Init_ extends undefined
  //   ? {}
  //   : Init_ extends SubscriptionPromisePlugin<infer Methods>
  //     ? Methods
  //     : {};

  // export type Extended<Type, Plugin> = Type & Plugin;
}
