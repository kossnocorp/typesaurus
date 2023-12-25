import { schema, Typesaurus } from "..";

describe("update", () => {
  interface User {
    name: string;
    address: { city: string };
    visits: number;
    guest?: boolean;
    birthday?: Date;
  }

  interface Post {
    author: Typesaurus.Ref<User, "users">;
    text: string;
    date?: Date | undefined;
    tags?: (string | undefined)[];
  }

  interface Favorite {
    userId: Typesaurus.Id<"users">;
    favorites: string[];
  }

  interface Movies {
    title: string;
    likedBy: Typesaurus.Ref<User, "users">[];
  }

  interface Order {
    title: string;
    quantity: number;
  }

  const db = schema(($) => ({
    users: $.collection<User>().sub({
      orders: $.collection<Order>(),
    }),
    posts: $.collection<Post>(),
    favorites: $.collection<Favorite>(),
    movies: $.collection<Movies>(),
  }));

  interface UserWithDates {
    name: string;
    createdAt: Typesaurus.ServerDate;
    updatedAt?: Typesaurus.ServerDate;
    birthday: Date;
  }

  const dbWithDates = schema(($) => ({
    users: $.collection<UserWithDates>(),
  }));

  it("updates document", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });
    const { id } = user;
    await db.users.update(id, { name: "Sasha Koss" });
    const userFromDB = await db.users.get(id);
    expect(userFromDB?.data).toEqual({
      name: "Sasha Koss",
      address: { city: "Omsk" },
      visits: 0,
    });
  });

  it("allows updating via refs", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });
    await user.update({ name: "Sasha Koss" });
    await user.update(($) => [
      $.field("name").set("Sasha Koss"),
      $.field("address", "city").set("Moscow"),
    ]);
    const userFromDB = await db.users.get(user.id);
    expect(userFromDB?.data).toEqual({
      name: "Sasha Koss",
      address: { city: "Moscow" },
      visits: 0,
    });
  });

  it("allows update nested maps", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });
    const { id } = user;
    await db.users.update(id, ($) => [
      $.field("name").set("Sasha Koss"),
      $.field("address", "city").set("Dimitrovgrad"),
      $.field("visits").set($.increment(1)),
    ]);
    const userFromDB = await user.get();
    expect(userFromDB?.data).toEqual({
      name: "Sasha Koss",
      address: { city: "Dimitrovgrad" },
      visits: 1,
    });
  });

  it("allows updating single field", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });
    const { id } = user;
    await db.users.update(id, ($) => $.field("visits").set($.increment(1)));
    const userFromDB = await user.get();
    expect(userFromDB?.data.visits).toBe(1);
  });

  it("supports references", async () => {
    const userId1 = await db.users.id();
    const userId2 = await db.users.id();
    await db.users.set(userId1, {
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });
    await db.users.set(userId2, {
      name: "Tati",
      address: { city: "Dimitrovgrad" },
      visits: 0,
    });
    const postId = await db.posts.id();
    await db.posts.set(postId, {
      author: db.users.ref(userId1),
      text: "Hello!",
    });
    await db.posts.update(postId, { author: db.users.ref(userId2) });
    const postFromDB = await db.posts.get(postId);
    const userFromDB = postFromDB && (await postFromDB.data.author.get());
    expect(userFromDB?.data.name).toBe("Tati");
  });

  it("preserves undefineds", async () => {
    const userRef = db.users.ref(db.users.id("42"));
    const postRef = await db.posts.add({
      author: userRef,
      text: "Hello!",
      date: new Date(),
    });
    await postRef.update({
      date: undefined,
      tags: ["hello", undefined, "world"],
    });
    const postFromDB = await postRef.get();
    expect(postFromDB?.data.date).toEqual(undefined);
    expect(postFromDB?.data.tags).toEqual(["hello", undefined, "world"]);
  });

  it("allows removing values", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
      guest: true,
    });
    const { id } = user;
    await db.users.update(id, ($) => ({ guest: $.remove() }));
    const userFromDB = await db.users.get(id);
    expect(userFromDB?.data).toEqual({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });
  });

  it("allows incrementing values", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });
    const { id } = user;
    await db.users.update(id, ($) => ({ visits: $.increment(2) }));
    const userFromDB = await db.users.get(id);
    expect(userFromDB?.data).toEqual({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 2,
    });
  });

  it("supports dates", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      birthday: new Date(1987, 2, 11),
      visits: 0,
    });
    const { id } = user;
    await db.users.update(id, { birthday: new Date(1987, 1, 11) });
    const userFromDB = await db.users.get(id);
    expect(userFromDB?.data).toEqual({
      name: "Sasha",
      address: { city: "Omsk" },
      birthday: new Date(1987, 1, 11),
      visits: 0,
    });
  });

  it("supports server dates", async () => {
    const user = await dbWithDates.users.add({
      name: "Sasha",
      // @ts-ignore: we want to test server dates
      createdAt: new Date(2000, 0, 1),
      // @ts-ignore: we want to test server dates
      updatedAt: new Date(2000, 0, 1),
      birthday: new Date(1987, 1, 11),
    });
    const { id } = user;
    await dbWithDates.users.update(id, ($) => ({ updatedAt: $.serverDate() }));
    const userFromDB = await dbWithDates.users.get(id);
    const dateFromDB = userFromDB?.data.updatedAt;
    const now = Date.now();
    expect(dateFromDB).toBeInstanceOf(Date);
    expect(
      dateFromDB!.getTime() <= now && dateFromDB!.getTime() > now - 10000,
    ).toBe(true);
  });

  it("allows to build update", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });
    const { id } = user;

    const $ = db.users.update.build(id);
    $.field("name").set("Sasha Koss");
    $.field("address", "city").set("Dimitrovgrad");
    $.field("visits").set($.increment(1));
    await $.run();

    const userFromDB = await user.get();
    expect(userFromDB?.data).toEqual({
      name: "Sasha Koss",
      address: { city: "Dimitrovgrad" },
      visits: 1,
    });
  });

  it("works with empty update", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });

    await db.users.update(user.id, () => []);
    await db.users.update(user.id, () => ({}));
    await db.users.update(user.id, {});

    await user.update(() => []);
    await user.update(() => ({}));
    await user.update({});

    const $ = user.update.build();
    await $.run();
  });

  it("works with falsy update", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });

    expect(db.users.update(user.id, () => undefined)).toBeUndefined();
    expect(db.users.update(user.id, () => null)).toBeUndefined();
    expect(db.users.update(user.id, () => false)).toBeUndefined();
    expect(db.users.update(user.id, () => "")).toBeUndefined();
    expect(db.users.update(user.id, () => 0)).toBeUndefined();

    expect(user.update(() => undefined)).toBeUndefined();
    expect(user.update(() => null)).toBeUndefined();
    expect(user.update(() => false)).toBeUndefined();
    expect(user.update(() => "")).toBeUndefined();
    expect(user.update(() => 0)).toBeUndefined();
  });

  it("filter outs falsy updates", async () => {
    const user = await db.users.add({
      name: "Sasha",
      address: { city: "Omsk" },
      visits: 0,
    });

    await user.update(($) => [
      $.field("name").set("Sasha Koss"),
      undefined,
      null,
      false,
      "",
      0,
    ]);

    const userFromDB = await user.get();

    expect(userFromDB?.data).toEqual({
      name: "Sasha Koss",
      address: { city: "Omsk" },
      visits: 0,
    });
  });

  describe("assering environment", () => {
    it("allows to assert environment", async () => {
      const userId = await db.users.id();
      await dbWithDates.users.set(userId, ($) => ({
        name: "Sasha",
        createdAt: $.serverDate(),
        updatedAt: $.serverDate(),
        birthday: new Date(1987, 1, 11),
      }));

      const server = () =>
        dbWithDates.users.update(
          userId,
          { updatedAt: new Date() },
          { as: "server" },
        );

      const client = () =>
        dbWithDates.users.update(
          userId,
          ($) => ({ updatedAt: $.serverDate() }),
          {
            as: "client",
          },
        );

      if (typeof window === "undefined") {
        await server();
        expect(client).toThrowError("Expected client environment");
      } else {
        await client();
        expect(server).toThrowError("Expected server environment");
      }
    });

    it("allows to assert environment as the builder", async () => {
      const userId = await db.users.id();
      await dbWithDates.users.set(userId, ($) => ({
        name: "Sasha",
        createdAt: $.serverDate(),
        updatedAt: $.serverDate(),
        birthday: new Date(1987, 1, 11),
      }));

      const server = () =>
        dbWithDates.users.update.build(userId, { as: "server" });

      const client = () =>
        dbWithDates.users.update.build(userId, {
          as: "client",
        });

      if (typeof window === "undefined") {
        await server();
        expect(client).toThrowError("Expected client environment");
      } else {
        await client();
        expect(server).toThrowError("Expected server environment");
      }
    });
  });

  describe("ref", () => {
    it("works on refs", async () => {
      const id = await db.movies.id();
      const movieRef = db.movies.ref(id);
      await movieRef.set({ title: "Better Call Saul", likedBy: [] });
      await movieRef.update({ title: "Better Call Jimmy" });
      const movie = await movieRef.get();
      expect(movie?.data).toEqual({ title: "Better Call Jimmy", likedBy: [] });
    });

    it("allows to build update", async () => {
      const id = await db.movies.id();
      const movieRef = db.movies.ref(id);
      await movieRef.set({ title: "Better Call Saul", likedBy: [] });

      const $ = movieRef.update.build();
      $.field("title").set("Better Call Jimmy");
      await $.run();

      const movie = await movieRef.get();
      expect(movie?.data).toEqual({ title: "Better Call Jimmy", likedBy: [] });
    });

    describe("assering environment", () => {
      it("allows to assert environment", async () => {
        const userId = await db.users.id();
        await dbWithDates.users.set(userId, ($) => ({
          name: "Sasha",
          createdAt: $.serverDate(),
          updatedAt: $.serverDate(),
          birthday: new Date(1987, 1, 11),
        }));

        const server = () =>
          dbWithDates.users
            .ref(userId)
            .update({ updatedAt: new Date() }, { as: "server" });

        const client = () =>
          dbWithDates.users
            .ref(userId)
            .update(($) => ({ updatedAt: $.serverDate() }), { as: "client" });

        if (typeof window === "undefined") {
          await server();
          expect(client).toThrowError("Expected client environment");
        } else {
          await client();
          expect(server).toThrowError("Expected server environment");
        }
      });

      it("allows to assert environment as the builder", async () => {
        const userId = await db.users.id();
        await dbWithDates.users.set(userId, ($) => ({
          name: "Sasha",
          createdAt: $.serverDate(),
          updatedAt: $.serverDate(),
          birthday: new Date(1987, 1, 11),
        }));

        const server = () =>
          dbWithDates.users.ref(userId).update.build({ as: "server" });

        const client = () =>
          dbWithDates.users.ref(userId).update.build({ as: "client" });

        if (typeof window === "undefined") {
          await server();
          expect(client).toThrowError("Expected client environment");
        } else {
          await client();
          expect(server).toThrowError("Expected server environment");
        }
      });
    });
  });

  describe("doc", () => {
    it("works on docs", async () => {
      const id = await db.movies.id();
      const movieRef = db.movies.ref(id);
      await movieRef.set({ title: "Better Call Saul", likedBy: [] });
      const movieDoc = await movieRef.get();
      await movieDoc?.update({ title: "Better Call Jimmy" });
      const movie = await movieRef.get();
      expect(movie?.data).toEqual({ title: "Better Call Jimmy", likedBy: [] });
    });

    it("allows to build update", async () => {
      const id = await db.movies.id();
      const movieRef = db.movies.ref(id);
      await movieRef.set({ title: "Better Call Saul", likedBy: [] });
      const movieDoc = await movieRef.get();
      if (!movieDoc) throw new Error("The doc is not found");

      const $ = movieDoc.update.build();
      $.field("title").set("Better Call Jimmy");
      await $.run();

      const movie = await movieRef.get();
      expect(movie?.data).toEqual({ title: "Better Call Jimmy", likedBy: [] });
    });

    describe("assering environment", () => {
      it("allows to assert environment", async () => {
        const userId = await db.users.id();
        await dbWithDates.users.set(userId, ($) => ({
          name: "Sasha",
          createdAt: $.serverDate(),
          updatedAt: $.serverDate(),
          birthday: new Date(1987, 1, 11),
        }));

        // @ts-ignore: data is not important here
        const doc = dbWithDates.users.doc(userId, {});

        const server = () =>
          doc.update({ updatedAt: new Date() }, { as: "server" });

        const client = () =>
          doc.update(($) => ({ updatedAt: $.serverDate() }), { as: "client" });

        if (typeof window === "undefined") {
          await server();
          expect(client).toThrowError("Expected client environment");
        } else {
          await client();
          expect(server).toThrowError("Expected server environment");
        }
      });

      it("allows to assert environment as the builder", async () => {
        const userId = await db.users.id();
        await dbWithDates.users.set(userId, ($) => ({
          name: "Sasha",
          createdAt: $.serverDate(),
          updatedAt: $.serverDate(),
          birthday: new Date(1987, 1, 11),
        }));

        // @ts-ignore: data is not important here
        const doc = dbWithDates.users.doc(userId, {});

        const server = () => doc.update.build({ as: "server" });

        const client = () => doc.update.build({ as: "client" });

        if (typeof window === "undefined") {
          await server();
          expect(client).toThrowError("Expected client environment");
        } else {
          await client();
          expect(server).toThrowError("Expected server environment");
        }
      });
    });
  });

  describe("subcollection", () => {
    it("works on subcollections", async () => {
      const userId = await db.users.id();
      const orderId = await db.users.sub.orders.id();
      const orderRef = await db
        .users(userId)
        .orders.set(orderId, { title: "Amazing product", quantity: 42 });
      await db.users(userId).orders.update(orderRef.id, { quantity: 41 });
      const order = await db.users(userId).orders.get(orderRef.id);
      expect(order?.data.quantity).toBe(41);
    });
  });

  describe("updating arrays", () => {
    it("union update", async () => {
      const userId = await db.users.id();
      const fav = await db.favorites.add({
        userId,
        favorites: [
          "Sapiens",
          "The 22 Immutable Laws of Marketing",
          "The Mom Test",
        ],
      });
      const { id } = fav;
      await db.favorites.update(id, ($) => ({
        favorites: $.arrayUnion([
          "Harry Potter and the Sorcerer's Stone",
          "Harry Potter and the Chamber of Secrets",
        ]),
      }));
      const favFromDB = await db.favorites.get(id);
      expect(favFromDB?.data).toEqual({
        userId,
        favorites: [
          "Sapiens",
          "The 22 Immutable Laws of Marketing",
          "The Mom Test",
          "Harry Potter and the Sorcerer's Stone",
          "Harry Potter and the Chamber of Secrets",
        ],
      });
    });

    it("remove update", async () => {
      const userId = await db.users.id();
      const fav = await db.favorites.add({
        userId,
        favorites: [
          "Sapiens",
          "The 22 Immutable Laws of Marketing",
          "The Mom Test",
        ],
      });
      const { id } = fav;
      await db.favorites.update(id, ($) => ({
        favorites: $.arrayRemove([
          "The 22 Immutable Laws of Marketing",
          "Sapiens",
        ]),
      }));
      const favFromDB = await db.favorites.get(id);
      expect(favFromDB?.data).toEqual({
        userId,
        favorites: ["The Mom Test"],
      });
    });

    it("union update references", async () => {
      const user1 = db.users.ref(await db.users.id());
      const user2 = db.users.ref(await db.users.id());
      const movie = await db.movies.add({
        title: "Harry Potter and the Sorcerer's Stone",
        likedBy: [user1],
      });

      await movie.update(($) => ({
        likedBy: $.arrayUnion([user2]),
      }));
      const movieFromDB = await movie.get();
      expect(movieFromDB?.data.likedBy.length).toBe(2);
      expect(movieFromDB?.data.likedBy[0]?.id).toBe(user1.id);
      expect(movieFromDB?.data.likedBy[1]?.id).toBe(user2.id);
    });

    it("remove update references", async () => {
      const user1 = db.users.ref(await db.users.id());
      const user2 = db.users.ref(await db.users.id());
      const movie = await db.movies.add({
        title: "Harry Potter and the Chamber of Secrets",
        likedBy: [user1, user2],
      });

      await movie.update(($) => ({
        likedBy: $.arrayRemove([user2]),
      }));
      const bookFromDB = await movie.get();
      expect(bookFromDB?.data.likedBy.length).toBe(1);
      expect(bookFromDB?.data.likedBy[0]?.id).toBe(user1.id);
    });
  });
});
