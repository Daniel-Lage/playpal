"use server";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { db } from "./db";
import { repliesTable, postsTable, playlistsTable } from "./db/schema";
import type { PlaylistObject } from "~/models/playlist.model";

export async function getPlaylists({
  userIds,
  lastQueried,
}: {
  userIds?: string[];
  lastQueried?: Date;
}) {
  const playlists = await db.query.playlistsTable.findMany({
    with: {
      owner: true,
      likes: { with: { liker: true } },
      replies: {
        with: {
          author: true,
          likes: {
            with: {
              liker: true,
            },
          },
          replies: {
            // only gets direct replies
            where: eq(repliesTable.separation, 0),
          },
        },
      },
    },
    orderBy: [desc(playlistsTable.createdAt)],
    where: and(
      userIds ? inArray(postsTable.userId, userIds) : undefined,
      lastQueried && sql`${postsTable.createdAt} > ${lastQueried}`, // get new playlists
    ),
    limit: 100,
  });

  return playlists as PlaylistObject[];
}
