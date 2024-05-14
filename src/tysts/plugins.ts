import { triggerAsyncId } from "async_hooks";
import { TypesaurusCore, schema } from "..";
import { createPlugin } from "../plugins";

interface User {
  name: string;
  age: number;
}

// Without plugins
{
  const db = schema(($) => ({
    users: $.collection<User>(),
  }));

  // The property is not available
  // @ts-expect-error
  db.users.all().hello;
}

// Basic plugin
{
  const plugin = createPlugin({
    sp(sp) {
      return {
        hello(who: string) {
          return true;
        },
      };
    },
  });

  const db = schema(
    ($) => ({
      users: $.collection<User>(),
    }),
    { plugins: [plugin] },
  );

  // It infers argument types

  const result = db.users.all().hello("World");

  // @ts-expect-error
  db.users.all().hello();
  // @ts-expect-error
  db.users.all().hello(123);
  // @ts-expect-error
  db.users.all().hello("World", 123);

  // It infers the result
  result satisfies boolean;
}

// Advanced plugin
{
  const plugin = createPlugin({
    sp(sp) {
      return {
        works: true,

        fetch() {
          return sp.then();
        },
      };
    },
  });

  const db = schema(
    ($) => ({
      users: $.collection<User>(),
    }),
    { plugins: [plugin] },
  );

  // It infers argument properties

  db.users.all().works satisfies boolean;

  // It infers the original subscription promise

  async function test() {
    const result = await db.users.all().fetch();
    if (result) result.data.age satisfies number;

    // It should not be any
    // @ts-expect-error
    result.whatever;
  }
}
