"use server";
import {
  type IMetadata,
  PostType,
  type MainPostObject,
} from "~/models/post.model";
import { db } from "./db";
import { postsTable, repliesTable } from "./db/schema";
import { ActionStatus } from "~/models/status.model";
import { postMentions } from "./post-mentions";

export async function postPost(
  content: string,
  userId: string,
  mentions: string[] | undefined,
  metadata: IMetadata | undefined,
  parent?: MainPostObject,
): Promise<ActionStatus> {
  const result = await db
    .insert(postsTable)
    .values({
      content,
      userId,
      type: parent ? PostType.Reply : PostType.Post,
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

  if (mentions != null && mentions.length > 0)
    await postMentions(post.id, mentions);

  return ActionStatus.Success;
}
