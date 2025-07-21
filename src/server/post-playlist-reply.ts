"use server";
import {
  type Substring,
  type IMetadata,
  PostType,
  postPostStatus,
} from "~/models/post.model";
import { db } from "./db";
import { postsTable } from "./db/schema";

export async function postPlaylistReply(
  content: string,
  userId: string,
  playlistId: string,
  urls: Substring[] | undefined,
  metadata: IMetadata | undefined,
): Promise<postPostStatus> {
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

  if (!post) return postPostStatus.ServerError;

  return postPostStatus.Sucess;
}
