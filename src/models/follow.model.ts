import type { followsTable } from "~/server/db/schema";
import type { UserObject } from "./user.model";

interface followRelations {
  follower?: UserObject;
  followee?: UserObject;
}

export type FollowObject = typeof followsTable.$inferSelect & followRelations;
