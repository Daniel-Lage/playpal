"use server";
import { eq } from "drizzle-orm";
import type { UserObject } from "~/models/user.model";
import { db } from "./db";
import { usersTable, repliesTable } from "./db/schema";

export async function getUser(
  profileId: string,
): Promise<UserObject | undefined> {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.providerAccountId, profileId),
    with: {
      posts: {
        with: {
          author: true,
          likes: true,
          replies: {
            // only gets direct replies
            where: eq(repliesTable.separation, 0),
          },
        },
      },
      likes: {
        with: {
          likee: {
            with: {
              author: true,
              likes: true,
              replies: {
                // only gets direct replies
                where: eq(repliesTable.separation, 0),
              },
            },
          },
        },
      },
      followers: true,
      following: true,
    },
  });

  return user as UserObject;
}
