"use server";
import { type IMetadata, PostType } from "~/models/post.model";
import { db } from "./db";
import { postsTable } from "./db/schema";
import { ActionStatus } from "~/models/status.model";
import { postMentions } from "./post-mentions";

export async function postPlaylistReply(
  content: string,
  userId: string,
  playlistId: string,
  mentions: string[] | undefined,
  metadata: IMetadata | undefined,
): Promise<ActionStatus> {
  const result = await db
    .insert(postsTable)
    .values({
      content,
      userId,
      type: PostType.Reply,
      urlMetadata: metadata,
      playlistId,
    })
    .returning();

  const post = result[0];

  if (!post) return ActionStatus.Failure;

  if (mentions != null && mentions.length > 0)
    await postMentions(post.id, mentions);

  return ActionStatus.Success;
}
