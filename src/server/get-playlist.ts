"use server";
import { eq, desc } from "drizzle-orm";
import type { PostObject } from "~/models/post.model";
import { db } from "./db";
import { playlistsTable, repliesTable } from "./db/schema";
import type { PlaylistObject } from "~/models/playlist.model";
import { Threadify } from "~/helpers/get-reply-thread";

export async function getPlaylist(playlistId: string) {
  const playlist = (await db.query.playlistsTable.findFirst({
    with: {
      owner: true,
      likes: {
        with: {
          liker: true,
        },
      },
      replies: {
        with: {
          author: true,
          likes: true,
          thread: true,
          replies: {
            // only gets direct replies
            where: eq(repliesTable.separation, 0),
          },
        },
      },
    },
    orderBy: [desc(playlistsTable.createdAt)],
    where: eq(playlistsTable.id, playlistId),
  })) as PlaylistObject;

  if (!playlist) return undefined;

  if (playlist?.replies) {
    const replyThreads = playlist.replies
      .filter((value) => value.thread?.length === 0)
      .map((reply) => [reply]);

    for (const replyThread of replyThreads) {
      Threadify<PostObject>(
        replyThread,
        playlist.replies,
        (reply, leaf) => reply.id === leaf?.replies?.[0]?.replierId,
        (value) => !!value?.replies,
      );
    }

    return { ...playlist, replyThreads } as PlaylistObject;
  }
  return playlist;
}
