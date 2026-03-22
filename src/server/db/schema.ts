import {
  boolean,
  timestamp,
  text,
  primaryKey,
  integer,
  pgTableCreator,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import type { PostType, IMetadata } from "~/models/post.model";

const createTable = pgTableCreator((name) => `playpal_${name}`);

export const usersTable = createTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const accountsTable = createTable(
  "account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessionsTable = createTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokensTable = createTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

export const authenticatorsTable = createTable(
  "authenticator",
  {
    credentialID: text("credential_id").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerAccountId: text("provider_account_id").notNull(),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credential_device_type").notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ],
);

export const postsTable = createTable("post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  content: varchar("content", { length: 1024 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
  type: varchar("type").$type<PostType>().notNull(),
  urlMetadata: jsonb("url_metadata").$type<IMetadata>(),
  playlistId: text("playlist_id").references(() => playlistsTable.id, {
    onDelete: "cascade",
  }),
});

export const repliesTable = createTable(
  "reply",
  {
    replierId: text("replier_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    replieeId: text("repliee_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    separation: integer("separation").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (reply) => [
    primaryKey({
      columns: [reply.replieeId, reply.replierId],
    }),
  ],
);

export const likesTable = createTable(
  "like",
  {
    postId: text("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (like) => [
    primaryKey({
      columns: [like.postId, like.userId],
    }),
  ],
);

export const followsTable = createTable(
  "follow",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    followeeId: text("followee_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (follow) => [
    primaryKey({
      columns: [follow.followeeId, follow.followerId],
    }),
  ],
);

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable, { relationName: "author" }),
  playlists: many(playlistsTable, { relationName: "owner" }),
  likes: many(likesTable, {
    relationName: "liker",
  }),
  following: many(followsTable, {
    relationName: "follower",
  }),
  followers: many(followsTable, {
    relationName: "followee",
  }),
}));

export const postsTableRelations = relations(postsTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [postsTable.userId],
    references: [usersTable.id],
    relationName: "author",
  }),
  playlist: one(playlistsTable, {
    fields: [postsTable.playlistId],
    references: [playlistsTable.id],
    relationName: "playlist",
  }),
  thread: many(repliesTable, {
    relationName: "replier",
  }),
  replies: many(repliesTable, {
    relationName: "repliee",
  }),
  likes: many(likesTable, {
    relationName: "likee",
  }),
}));

export const repliesTableRelations = relations(repliesTable, ({ one }) => ({
  replier: one(postsTable, {
    fields: [repliesTable.replierId],
    references: [postsTable.id],
    relationName: "replier",
  }),
  repliee: one(postsTable, {
    fields: [repliesTable.replieeId],
    references: [postsTable.id],
    relationName: "repliee",
  }),
}));

export const likesTableRelations = relations(likesTable, ({ one }) => ({
  likee: one(postsTable, {
    fields: [likesTable.postId],
    references: [postsTable.id],
    relationName: "likee",
  }),
  liker: one(usersTable, {
    fields: [likesTable.userId],
    references: [usersTable.id],
    relationName: "liker",
  }),
}));

export const followsTableRelations = relations(followsTable, ({ one }) => ({
  follower: one(usersTable, {
    fields: [followsTable.followerId],
    references: [usersTable.id],
    relationName: "follower",
  }),
  followee: one(usersTable, {
    fields: [followsTable.followeeId],
    references: [usersTable.id],
    relationName: "followee",
  }),
}));

export const playlistsTable = createTable("playlist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  image: text("image").notNull(),
  totalTracks: integer("total_tracks").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  externalUrl: text("external_url").notNull(),
  description: text("description"),
});

export const playlistLikesTable = createTable(
  "playlist_like",
  {
    playlistId: text("playlist_id")
      .notNull()
      .references(() => playlistsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (like) => [
    primaryKey({
      columns: [like.playlistId, like.userId],
    }),
  ],
);

export const playlistsTableRelations = relations(
  playlistsTable,
  ({ one, many }) => ({
    owner: one(usersTable, {
      fields: [playlistsTable.userId],
      references: [usersTable.id],
      relationName: "owner",
    }),
    replies: many(postsTable, {
      relationName: "playlist",
    }),
    likes: many(playlistLikesTable, {
      relationName: "likee",
    }),
  }),
);

export const playlistLikesTableRelations = relations(
  playlistLikesTable,
  ({ one }) => ({
    likee: one(playlistsTable, {
      fields: [playlistLikesTable.playlistId],
      references: [playlistsTable.id],
      relationName: "likee",
    }),
    liker: one(usersTable, {
      fields: [playlistLikesTable.userId],
      references: [usersTable.id],
      relationName: "liker",
    }),
  }),
);

export const mentionsTable = createTable(
  "mention",
  {
    postId: text("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (like) => [
    primaryKey({
      columns: [like.postId, like.userId],
    }),
  ],
);

export const mentionsTableRelations = relations(mentionsTable, ({ one }) => ({
  mentionee: one(usersTable, {
    fields: [mentionsTable.userId],
    references: [usersTable.id],
    relationName: "mentionee",
  }),
  mentioner: one(postsTable, {
    fields: [mentionsTable.postId],
    references: [postsTable.id],
    relationName: "mentioner",
  }),
}));
