import { describe, expect, it } from "vitest";
import { schema } from "..";

describe("ref", () => {
  interface User {
    name: string;
  }

  const db = schema(($) => ({
    users: $.collection<User>(),
  }));

  it("creates ref object", () => {
    const userRef = db.users.ref(db.users.id("42"));
    expect(userRef).toEqual(
      expect.objectContaining({
        type: "ref",
        id: "42",
      }),
    );
    expect(userRef.collection.type).toBe("collection");
    expect(userRef.collection.path).toBe("users");
    expect("get" in userRef.collection).toBe(true);
  });

  describe("as", () => {
    const ref = db.users.ref(db.users.id("42"));

    it("returns the ref", () => {
      expect(ref.as()).toBe(ref);
    });
  });
});
