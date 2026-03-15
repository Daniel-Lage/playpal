"use server";
import type { UserObject } from "~/models/user.model";
import { db } from "./db";

export async function getUsers(): Promise<UserObject[] | undefined> {
  const users = await db.query.usersTable.findMany({
    with: {
      followers: true,
    },
  });

  return users as UserObject[];
}
