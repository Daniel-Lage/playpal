"use server";
import {
  type Substring,
  type IMetadata,
  PostType,
  type MainPostObject,
} from "~/models/post.model";
import { db } from "./db";
import { postsTable, repliesTable } from "./db/schema";
import { ActionStatus } from "~/models/status.model";

export async function postPost(
  content: string,
  userId: string,
  urls: Substring[] | undefined,
  metadata: IMetadata | undefined,
  parent?: MainPostObject,
): Promise<ActionStatus> {
  const result = await db
    .insert(postsTable)
    .values({
      content,
      userId,
      type: parent ? PostType.Reply : PostType.Post,
      urls,
      urlMetadata: metadata,
      playlistId: parent?.playlistId,
    })
    .returning();
  const post = result[0];

  if (!post) return ActionStatus.Failure;

  if (parent) {
    await db
      .insert(repliesTable)
      .values({ replierId: post.id, replieeId: parent.id, separation: 0 });

    if (parent.thread) {
      const newThread = [...parent.thread];
      newThread.reverse();
      for (let index = 0; index <= newThread.length; index++) {
        const replieeId = newThread[index]?.replieeId;
        if (replieeId)
          await db.insert(repliesTable).values({
            replierId: post.id,
            replieeId,
            separation: index + 1,
          });
      }
    }
  }

  return ActionStatus.Success;
}
