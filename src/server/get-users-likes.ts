"use server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { likesTable, playlistLikesTable, repliesTable } from "./db/schema";
import type { PostObject } from "~/models/post.model";
import type { PlaylistObject } from "~/models/playlist.model";

export async function getUsersLikes(
  userId: string,
  lastQueried?: Date,
): Promise<{ posts: PostObject[]; playlists: PlaylistObject[] }> {
  const postLikes = await db.query.likesTable.findMany({
    where: and(
      eq(likesTable.userId, userId),
      lastQueried && sql`${likesTable.createdAt} > ${lastQueried}`, // get new posts
    ),
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
  });

  const posts = postLikes.map((like) => like.likee);

  const playlistLikes = await db.query.playlistLikesTable.findMany({
    where: and(
      eq(playlistLikesTable.userId, userId),
      lastQueried && sql`${likesTable.createdAt} > ${lastQueried}`, // get new playlists
    ),
    with: {
      likee: {
        with: {
          owner: true,
          likes: true,
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
      },
    },
  });

  const playlists = playlistLikes.map((like) => like.likee);

  return { posts, playlists } as {
    posts: PostObject[];
    playlists: PlaylistObject[];
  };
}
