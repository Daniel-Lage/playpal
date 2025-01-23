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

// import type { AdapterAccountType } from "next-auth/adapters" <- not here
import type { AdapterAccountType } from ".pnpm/@auth+core@0.34.2/node_modules/@auth/core/adapters";
import type { PostType, IMetadata, Substring } from "~/models/post.model";

export const createTable = pgTableCreator((name) => `playpal_${name}`);

export const usersTable = createTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  providerAccountId: text("providerAccountId").notNull(),
  access_token: text("acess_token"),
});

export const accountsTable = createTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessionsTable = createTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokensTable = createTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticatorsTable = createTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

export const postsTable = createTable("post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  content: varchar("content", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date(),
  ),
  type: varchar("type").$type<PostType>().notNull(),
  urls: jsonb("urls").$type<Substring[]>(),
  urlMetadata: jsonb("urlMetadata").$type<IMetadata>(),
});

export const repliesTable = createTable("reply", {
  replierId: text("replierId")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  replieeId: text("replieeId").references(() => postsTable.id, {
    onDelete: "set null",
  }),
  separation: integer("separation").notNull(),
});

export const likesTable = createTable("like", {
  postId: text("postId")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const followsTable = createTable("follow", {
  followerId: text("followerId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  followeeId: text("followeeId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable, { relationName: "author" }),
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
    // gets all posts a specific post is replying to
    fields: [repliesTable.replierId],
    references: [postsTable.id],
    relationName: "replier",
  }),
  repliee: one(postsTable, {
    fields: [repliesTable.replieeId], // gets all posts replying to a specific post
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
