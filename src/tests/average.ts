import { beforeAll, describe, expect, it } from "vitest";
import { groups, schema } from "..";

describe("average", () => {
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
    averagePosts: $.collection<Post>().sub({
      averageComments: $.collection<Comment>(),
    }),
    averageProducts: $.collection<Product>().sub({
      averageComments: $.collection<Comment>(),
    }),
  }));

  const postId1 = db.averagePosts.id("1");
  const postId2 = db.averagePosts.id("2");
  const postId3 = db.averagePosts.id("3");
  const productId1 = db.averageProducts.id("1");
  const productId2 = db.averageProducts.id("2");
  const postComment1 = db.averagePosts.sub.averageComments.id("1");
  const postComment2 = db.averagePosts.sub.averageComments.id("2");
  const postComment3 = db.averagePosts.sub.averageComments.id("2");
  const productComment1 = db.averageProducts.sub.averageComments.id("1");
  const productComment2 = db.averageProducts.sub.averageComments.id("2");

  beforeAll(async () => {
    await Promise.all([
      db.averagePosts.set(postId1, {
        title: "First post",
        text: "Hello world",
        rating: 8,
      }),

      db.averagePosts(postId1).averageComments.set(postComment1, {
        text: "Great post",
        rating: 10,
      }),

      db.averagePosts(postId1).averageComments.set(postComment2, {
        text: "Average",
        rating: 5,
      }),

      db.averagePosts.set(postId2, {
        title: "Second post",
        text: "Hello world",
        rating: 3,
      }),

      db.averagePosts(postId3).averageComments.set(postComment3, {
        text: "Bad post",
        rating: 2,
      }),

      db.averagePosts.set(postId1, {
        title: "First post",
        text: "Just kidding",
        rating: 5,
      }),

      db.averageProducts.set(productId1, {
        title: "Some product",
        rating: 1,
      }),

      db.averageProducts(productId1).averageComments.set(productComment1, {
        text: "Bad product",
        rating: 1,
      }),

      db.averageProducts(productId1).averageComments.set(productComment2, {
        text: "Average",
        rating: 5,
      }),

      db.averageProducts.set(productId2, {
        title: "Another product",
        rating: 5,
      }),
    ]);
  });

  it("averages document fields in a collection", async () => {
    expect(await db.averagePosts.average("rating")).toBe(4);
    expect(await db.averageProducts.average("rating")).toBe(3);
  });

  it("averages document fields in a query", async () => {
    const count = await db.averagePosts
      .query(($) => $.field("title").eq("First post"))
      .average("rating");
    expect(count).toBe(5);
  });

  it("averages document fields in a group collection", async () => {
    const count = await groups(db).averageComments.average("rating");
    expect(count).toBe(4.6);
  });
});
