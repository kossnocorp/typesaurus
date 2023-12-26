import { beforeEach, describe, expect, it } from "vitest";
import { groups, schema } from "..";

describe("count", () => {
  interface Novel {
    title: string;
  }

  interface Manga {
    title: string;
    volume: number;
  }

  const db = schema(($) => ({
    novels: $.collection<Novel>().sub({
      feedbacks: $.collection<any>(),
    }),
    mangas: $.collection<Manga>().sub({
      feedbacks: $.collection<any>(),
    }),
  }));

  beforeEach(async () => {
    await Promise.all([
      db.novels.set(db.novels.id("sapiens"), {
        title: "Sapiens",
      }),
      db.novels.set(db.novels.id("22laws"), {
        title: "The 22 Immutable Laws of Marketing",
      }),
      db.mangas.set(db.mangas.id("naruto-1"), {
        title: "Naruto",
        volume: 1,
      }),
      db.mangas.set(db.mangas.id("naruto-2"), {
        title: "Naruto",
        volume: 2,
      }),
    ]);

    const sapiens = db.novels(db.novels.id("sapiens"));
    const naruto1 = db.mangas(db.mangas.id("naruto-1"));
    const naruto2 = db.mangas(db.mangas.id("naruto-2"));

    await Promise.all([
      sapiens.feedbacks.set(sapiens.feedbacks.id("1"), { text: "Great novel" }),
      naruto1.feedbacks.set(naruto1.feedbacks.id("2"), { text: "Great manga" }),
      naruto2.feedbacks.set(naruto2.feedbacks.id("3"), { text: "Great manga" }),
      naruto2.feedbacks.set(naruto2.feedbacks.id("4"), {
        text: "Average. First one was better",
      }),
    ]);
  });

  it("counts documents in a collection", async () => {
    const count = await db.novels.count();
    expect(count).toBe(2);
  });

  it("counts documents in a query", async () => {
    const count = await db.mangas.query(($) => $.field("volume").eq(2)).count();
    expect(count).toBe(1);
  });

  it("counts documents in a group collection", async () => {
    const count = await groups(db).feedbacks.count();
    expect(count).toBe(4);
  });
});
