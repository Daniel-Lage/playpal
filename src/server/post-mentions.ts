"use server";

import { db } from "./db";
import { mentionsTable } from "./db/schema";
import { ActionStatus } from "~/models/status.model";

export async function postMentions(
  postId: string,
  mentions: string[],
): Promise<ActionStatus> {
  const result = await db
    .insert(mentionsTable)
    .values(mentions?.map((mention) => ({ userId: mention, postId })))
    .returning();

  if (result.length != mentions.length) return ActionStatus.Failure;

  return ActionStatus.Success;
}
