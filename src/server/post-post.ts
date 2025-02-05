"use server";
import {
  type Substring,
  type IMetadata,
  PostType,
  MainPostObject,
} from "~/models/post.model";
import { db } from "./db";
import { postsTable, repliesTable } from "./db/schema";

export async function postPost(
  content: string,
  userId: string,
  urls: Substring[] | undefined,
  metadata: IMetadata | undefined,
  parent?: MainPostObject,
) {
  if (parent) {
    const posts = await db
      .insert(postsTable)
      .values({
        content,
        userId,
        type: PostType.Reply,
        urls,
        urlMetadata: metadata,
      })
      .returning();

    const postId = posts[0]?.id;

    if (postId) {
      await db
        .insert(repliesTable)
        .values({ replierId: postId, replieeId: parent.id, separation: 0 });

      if (parent.thread) {
        const newThread = [...parent.thread];
        newThread.reverse();
        for (let index = 0; index <= newThread.length; index++) {
          const replieeId = newThread[index]?.replieeId;
          if (replieeId)
            await db.insert(repliesTable).values({
              replierId: postId,
              replieeId,
              separation: index + 1,
            });
        }
      }
    }
  } else
    await db
      .insert(postsTable)
      .values({
        content,
        userId,
        type: PostType.Post,
        urls,
        urlMetadata: metadata,
      })
      .returning();
}
