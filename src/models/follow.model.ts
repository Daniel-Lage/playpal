import type { followsTable } from "~/server/db/schema";
import type { UserObject } from "./user.model";
import type { User } from "next-auth";

interface followRelations {
  follower?: UserObject | User;
  followee?: UserObject | User;
}

export type FollowObject = typeof followsTable.$inferSelect & followRelations;
