"use server";
import { eq } from "drizzle-orm";
import type { UserObject } from "~/models/user.model";
import { db } from "./db";
import { usersTable } from "./db/schema";

export async function getUserFollowers(
  profileId: string,
): Promise<UserObject | undefined> {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.providerAccountId, profileId),
    with: {
      followers: { with: { follower: true } },
    },
  });

  return user as UserObject;
}
