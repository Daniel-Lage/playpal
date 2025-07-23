import type { PlaylistObject } from "./playlist.model";
import type { PostObject } from "./post.model";
import type { UserObject } from "./user.model";

export interface NotificationObject {
  type: NotificationType; // potentially add more types in the future (mentions, quotes, etc.)
  createdAt: Date;
  notifier: PostObject | UserObject;
  notifierId: string;
  target?: PostObject | PlaylistObject;
}

export enum NotificationType {
  Reply = "Reply",
  Follow = "Follow",
  Like = "Like",
}

export const NotificationTypeOptions = Object.values(NotificationType);
