"use server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "./db";
import {
  repliesTable,
  postsTable,
  followsTable,
  playlistsTable,
  mentionsTable,
} from "./db/schema";
import type { FollowObject } from "~/models/follow.model";
import {
  NotificationType,
  type NotificationObject,
} from "~/models/notifications.model";
import type { UserObject } from "~/models/user.model";
import type { MentionObject } from "~/models/mention.model";

export async function getNotifications(userId: string, lastQueried?: Date) {
  const posts = await db.query.postsTable.findMany({
    with: {
      author: true,
      likes: { with: { liker: true } },
      replies: {
        with: {
          replier: {
            with: {
              author: true,
              likes: { with: { liker: true } },
              replies: {
                where: eq(repliesTable.separation, 0),
              },
            },
          },
        },
        where: eq(repliesTable.separation, 0),
      },
    },
    where: and(
      eq(postsTable.userId, userId),
      lastQueried && sql`${postsTable.createdAt} > ${lastQueried}`,
    ),
    limit: 100,
  });

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
            where: eq(repliesTable.separation, 0),
          },
        },
      },
    },
    where: and(
      eq(playlistsTable.userId, userId),
      lastQueried && sql`${postsTable.createdAt} > ${lastQueried}`,
    ),
    limit: 100,
  });

  const follows: FollowObject[] = await db.query.followsTable.findMany({
    where: eq(followsTable.followeeId, userId),
    with: { follower: true },
  });

  const mentions: MentionObject[] = await db.query.mentionsTable.findMany({
    where: eq(mentionsTable.userId, userId),
    with: {
      mentioner: {
        with: {
          author: true,
          likes: { with: { liker: true } },
          replies: {
            with: {
              replier: {
                with: {
                  author: true,
                  likes: { with: { liker: true } },
                  replies: {
                    where: eq(repliesTable.separation, 0),
                  },
                },
              },
            },
            where: eq(repliesTable.separation, 0),
          },
        },
      },
    },
  });

  const notifications: NotificationObject[] = [];

  follows.forEach((follow) =>
    notifications.push({
      type: NotificationType.Follow,
      createdAt: follow.createdAt,
      notifier: follow.follower as UserObject,
      notifierId: follow.followerId,
    }),
  );

  posts.forEach((post) => {
    if (post.replies) {
      post.replies.forEach((reply) => {
        if (reply.replier.author.id === userId) return;

        notifications.push({
          type: NotificationType.Reply,
          createdAt: reply.replier.createdAt,
          notifier: reply.replier,
          notifierId: reply.replierId,
          target: post,
        });
      });
    }

    if (post.likes) {
      post.likes.forEach((like) => {
        if (like.userId === userId) return;

        notifications.push({
          type: NotificationType.Like,
          createdAt: like.createdAt,
          notifier: like.liker as UserObject,
          notifierId: like.liker.id,
          target: post,
        });
      });
    }
  });

  playlists.forEach((playlist) => {
    if (playlist.replies) {
      playlist.replies.forEach((reply) => {
        if (reply.author.id === userId) return;

        notifications.push({
          type: NotificationType.Reply,
          createdAt: reply.createdAt,
          notifier: reply,
          notifierId: reply.id,
          target: playlist,
        });
      });
    }

    if (playlist.likes) {
      playlist.likes.forEach((like) => {
        if (like.userId === userId) return;

        notifications.push({
          type: NotificationType.Like,
          createdAt: like.createdAt,
          notifier: like.liker as UserObject,
          notifierId: like.liker.id,
          target: playlist,
        });
      });
    }
  });

  mentions.forEach((mention) => {
    if (mention.mentioner == null) return;

    notifications.push({
      type: NotificationType.Mention,
      createdAt: mention.mentioner.createdAt,
      notifier: mention.mentioner,
      notifierId: mention.mentioner.id,
    });
  });

  return notifications;
}
