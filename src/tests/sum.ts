import { beforeAll, describe, expect, it } from "vitest";
import { groups, schema } from "..";

describe("sum", () => {
  interface Comment {
    text: string;
    rating: number;
  }

  interface Post {
    title: string;
    text: string;
    rating: number;
  }

  interface Product {
    title: string;
    rating: number;
  }

  const db = schema(($) => ({
    sumPosts: $.collection<Post>().sub({
      sumComments: $.collection<Comment>(),
    }),
    sumProducts: $.collection<Product>().sub({
      sumComments: $.collection<Comment>(),
    }),
  }));

  const postId1 = db.sumPosts.id("1");
  const postId2 = db.sumPosts.id("2");
  const productId = db.sumProducts.id("1");
  const postComment1 = db.sumPosts.sub.sumComments.id("1");
  const postComment2 = db.sumPosts.sub.sumComments.id("2");
  const postComment3 = db.sumPosts.sub.sumComments.id("2");
  const productComment1 = db.sumProducts.sub.sumComments.id("1");
  const productComment2 = db.sumProducts.sub.sumComments.id("2");

  beforeAll(async () => {
    await Promise.all([
      db.sumPosts.set(postId1, {
        title: "First post",
        text: "Hello world",
        rating: 8,
      }),

      db.sumPosts(postId1).sumComments.set(postComment1, {
        text: "Great post",
        rating: 10,
      }),

      db.sumPosts(postId1).sumComments.set(postComment2, {
        text: "Average",
        rating: 5,
      }),

      db.sumPosts.set(postId2, {
        title: "Second post",
        text: "Hello world",
        rating: 3,
      }),

      db.sumPosts(postId2).sumComments.set(postComment3, {
        text: "Bad post",
        rating: 1,
      }),

      db.sumProducts.set(productId, {
        title: "Some product",
        rating: 1,
      }),

      db.sumProducts(productId).sumComments.set(productComment1, {
        text: "Bad product",
        rating: 1,
      }),

      db.sumProducts(productId).sumComments.set(productComment2, {
        text: "Average",
        rating: 5,
      }),
    ]);
  });

  it("sums document fields in a collection", async () => {
    expect(await db.sumPosts.sum("rating")).toBe(11);
    expect(await db.sumProducts.sum("rating")).toBe(1);
  });

  it("sums document fields in a query", async () => {
    const count = await db.sumPosts
      .query(($) => $.field("title").eq("First post"))
      .sum("rating");
    expect(count).toBe(8);
  });

  it("sums document fields in a group collection", async () => {
    const count = await groups(db).sumComments.sum("rating");
    expect(count).toBe(22);
  });
});
