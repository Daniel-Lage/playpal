import type { User } from "next-auth";
import type { UserObject } from "./user.model";
import type { PostObject } from "./post.model";
import type { mentionsTable } from "~/server/db/schema";
import type { MentionNodeAttrs } from "@tiptap/extension-mention";

interface mentionRelations {
  mentionee?: UserObject | User;
  mentioner?: PostObject;
}

export type MentionObject = typeof mentionsTable.$inferSelect &
  mentionRelations;

export interface MentionItem {
  id: string;
  label: string;
}

export interface MentionListRef {
  onKeyDown: ({ event }: { event: globalThis.KeyboardEvent }) => boolean;
}

export interface MentionListProps {
  items: MentionItem[];
  command: (props: MentionNodeAttrs) => void;
}
