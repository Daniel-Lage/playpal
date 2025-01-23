"use server";
import type { ReplyObject } from "~/models/reply.model";

export async function getReplyThread(
  replyThread: ReplyObject[],
  replies: ReplyObject[],
) {
  const leaf = replyThread.at(-1);

  const newLeaf = replies.find(
    (reply) => reply.replierId === leaf?.replier?.replies?.[0]?.replierId,
  );

  if (newLeaf) replyThread.push(newLeaf);

  if (newLeaf?.replier?.replies) {
    await getReplyThread(replyThread, replies);
  }
}
