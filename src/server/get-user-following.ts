"use server";
import { eq } from "drizzle-orm";
import type { UserObject } from "~/models/user.model";
import { db } from "./db";
import { usersTable } from "./db/schema";

export async function getUserFollowing(
  profileId: string,
): Promise<UserObject | undefined> {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.providerAccountId, profileId),
    with: {
      following: { with: { followee: true } },
    },
  });

  return user as UserObject;
}
