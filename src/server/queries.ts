import "only-server";
import { db } from "./db";
import { postsTable } from "./db/schema";

export async function getPosts() {
  const data = await db.select().from(postsTable).limit(100);
  return data;
}
