import { describe, expect, it } from "vitest";
import { schema, Typesaurus } from "..";

describe("doc", () => {
  interface User {
    name: string;
    createdAt: Typesaurus.ServerDate;
    updatedAt?: Typesaurus.ServerDate;
    birthday: Date;
  }

  interface Library {
    books: Record<string, Book | undefined>;
    returned: Array<Book | undefined>;
  }

  interface Book {
    title: string;
    attributes: Record<string, string | boolean | undefined>;
  }

  interface TextContent {
    type: "text";
    text: string;
    public?: boolean;
  }

  interface ImageContent {
    type: "image";
    src: string;
    public?: boolean;
  }

  const db = schema(($) => ({
    users: $.collection<User>(),
    libraries: $.collection<Library>(),
    content: $.collection<[TextContent, ImageContent]>(),
  }));

  it("creates doc object", () => {
    const createdAt = new Date() as Typesaurus.ServerDate;
    const birthday = new Date(1987, 1, 11);
    const userDoc = db.users.doc(db.users.id("42"), {
      name: "Sasha",
      createdAt,
      birthday,
    });

    expect(userDoc).toEqual(
      expect.objectContaining({
        type: "doc",
        ref: expect.objectContaining({
          type: "ref",
          id: "42",
          collection: expect.objectContaining({
            type: "collection",
            path: "users",
          }),
        }),
        data: { name: "Sasha", createdAt, birthday },
      }),
    );

    expect(userDoc.props.environment).toBe(
      typeof window === "undefined" ? "server" : "client",
    );
  });

  it("preserves undefineds", async () => {
    const doc = db.libraries.doc(await db.libraries.id(), {
      books: {
        "1984": {
          title: "1984",
          attributes: {
            hopeless: true,
            resolution: undefined,
          },
        },
        "this-bright-future": undefined,
      },
      returned: [
        undefined,
        {
          title: "Brave New World",
          attributes: {
            hopeless: true,
            resolution: undefined,
          },
        },
      ],
    });

    expect(doc.data).toEqual({
      books: {
        "1984": {
          title: "1984",
          attributes: {
            hopeless: true,
            resolution: undefined,
          },
        },
        "this-bright-future": undefined,
      },
      returned: [
        undefined,
        {
          title: "Brave New World",
          attributes: {
            hopeless: true,
            resolution: undefined,
          },
        },
      ],
    });
  });

  it("creates doc from Firebase snapshot", async () => {
    const userRef = await db.users.add(($) => ({
      name: "Sasha",
      createdAt: $.serverDate(),
      birthday: new Date(1987, 1, 11),
    }));

    const path = `users/${userRef.id}`;
    let snapshot;

    if (typeof window === "undefined") {
      const admin = (await import("firebase-admin")).default;
      snapshot = await admin.firestore().doc(path).get();
    } else {
      const { getDoc, doc, getFirestore } = await import("firebase/firestore");
      snapshot = await getDoc(doc(getFirestore(), path));
    }

    const user = db.users.doc(snapshot);
    expect(user?.data.createdAt).toBeInstanceOf(Date);
    expect(user?.data.birthday.getFullYear()).toBe(1987);
  });

  it("returns null if the snapshot does not exist", async () => {
    const userId = await db.users.id();

    const path = `users/${userId}`;
    let snapshot;

    if (typeof window === "undefined") {
      const admin = (await import("firebase-admin")).default;
      snapshot = await admin.firestore().doc(path).get();
    } else {
      const { getDoc, doc, getFirestore } = await import("firebase/firestore");
      snapshot = await getDoc(doc(getFirestore(), path));
    }

    const doc = db.users.doc(snapshot);
    expect(doc).toBe(null);
  });

  it("allows to assert environment", async () => {
    const server = () =>
      db.users.doc(
        db.users.id("42"),
        {
          name: "Sasha",
          createdAt: new Date(),
          birthday: new Date(1987, 1, 11),
        },
        { as: "server" },
      );
    const client = () =>
      db.users.doc(
        db.users.id("42"),
        {
          name: "Sasha",
          createdAt: new Date(),
          birthday: new Date(1987, 1, 11),
        },
        { as: "client" },
      );

    if (typeof window === "undefined") {
      await server();
      expect(client).toThrowError("Expected client environment");
    } else {
      await client();
      expect(server).toThrowError("Expected server environment");
    }
  });

  describe("test", () => {
    const contentDoc = db.content.doc(db.content.id("42"), {
      type: "text",
      text: "Hello, world!",
    });

    // @ts-ignore - ah yes yes, this is ok
    contentDoc.props = {
      environment: "client",
      source: "cache",
      dateStrategy: "estimate",
      pendingWrites: true,
    };

    it("checks if the props correspond to the given values", () => {
      expect(contentDoc.test({ environment: "client" })).toBe(true);
      expect(contentDoc.test({ environment: "server" })).toBe(false);

      expect(contentDoc.test({ source: "cache" })).toBe(true);
      expect(contentDoc.test({ source: "database" })).toBe(false);

      expect(contentDoc.test({ dateStrategy: "estimate" })).toBe(true);
      expect(contentDoc.test({ dateStrategy: "previous" })).toBe(false);
      expect(contentDoc.test({ dateStrategy: "none" })).toBe(false);

      expect(contentDoc.test({ pendingWrites: true })).toBe(true);
      expect(contentDoc.test({ pendingWrites: false })).toBe(false);
    });

    it("works in combo", () => {
      expect(
        contentDoc.test({
          environment: "client",
          source: "cache",
          dateStrategy: "estimate",
          pendingWrites: true,
        }),
      ).toBe(true);

      expect(
        contentDoc.test({
          environment: "client",
          pendingWrites: true,
        }),
      ).toBe(true);

      expect(
        contentDoc.test({
          environment: "client",
          source: "cache",
          dateStrategy: "estimate",
          pendingWrites: false,
        }),
      ).toBe(false);

      expect(
        contentDoc.test({
          environment: "client",
          pendingWrites: false,
        }),
      ).toBe(false);
    });
  });

  describe("narrow", () => {
    const doc = db.content.doc(db.content.id("42"), {
      type: "text",
      text: "Hello, world!",
    });

    it("returns the doc if the callback's returned value is not falsy", () => {
      expect(doc.narrow((data) => data.type === "text" && data)).toBe(doc);
    });

    it("returns false if the callback returns", () => {
      expect(doc.narrow((data) => data.type === "image" && data)).toBe(
        undefined,
      );
    });
  });

  describe("as", () => {
    const doc = db.content.doc(db.content.id("42"), {
      type: "text",
      text: "Hello, world!",
    });

    it("returns the doc", () => {
      expect(doc.as()).toBe(doc);
    });
  });
});
