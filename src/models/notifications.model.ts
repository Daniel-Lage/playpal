import type { PostObject } from "./post.model";
import type { UserObject } from "./user.model";

export interface NotificationObject {
  type: NotificationType; // potentially add more types in the future (mentions, quotes, etc.)
  createdAt: Date;
  notifier: PostObject | UserObject;
  notifierId: string;
  target?: PostObject | null;
}

export enum NotificationType {
  Reply = "reply",
  Follow = "follow",
  Like = "like",
}

export const NotificationTypeOptions = Object.values(NotificationType);
