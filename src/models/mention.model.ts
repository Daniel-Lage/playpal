import type { User } from "next-auth";
import type { UserObject } from "./user.model";
import type { PostObject } from "./post.model";
import type { mentionsTable } from "~/server/db/schema";

interface mentionRelations {
  mentionee?: UserObject | User;
  mentioner?: PostObject;
}

export type MentionObject = typeof mentionsTable.$inferSelect &
  mentionRelations;
