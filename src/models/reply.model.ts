import type { repliesTable } from "~/server/db/schema";
import type { PostObject } from "./post.model";

interface replyRelations {
  replier?: PostObject;
  repliee?: PostObject;
}

export type ReplyObject = typeof repliesTable.$inferSelect & replyRelations;
