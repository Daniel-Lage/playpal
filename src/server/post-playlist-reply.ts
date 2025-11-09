"use server";
import { type Substring, type IMetadata, PostType } from "~/models/post.model";
import { db } from "./db";
import { postsTable } from "./db/schema";
import { ActionStatus } from "~/models/status.model";

export async function postPlaylistReply(
  content: string,
  userId: string,
  playlistId: string,
  urls: Substring[] | undefined,
  metadata: IMetadata | undefined,
): Promise<ActionStatus> {
  const result = await db
    .insert(postsTable)
    .values({
      content,
      userId,
      type: PostType.Reply,
      urls,
      urlMetadata: metadata,
      playlistId,
    })
    .returning();
  const post = result[0];

  if (!post) return ActionStatus.Failure;

  return ActionStatus.Success;
}
