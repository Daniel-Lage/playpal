import type { PlaylistObject } from "./playlist.model";
import type { PostObject } from "./post.model";
import type { UserObject } from "./user.model";

export type NotificationObject =
  | {
      type: NotificationType.Reply;
      createdAt: Date;
      notifier: PostObject;
      notifierId: string;
      target: PostObject | PlaylistObject;
    }
  | {
      type: NotificationType.Follow;
      createdAt: Date;
      notifier: UserObject;
      notifierId: string;
      target: null;
    }
  | {
      type: NotificationType.Like;
      createdAt: Date;
      notifier: UserObject;
      notifierId: string;
      target: PostObject | PlaylistObject;
    }
  | {
      type: NotificationType.Mention;
      createdAt: Date;
      notifier: PostObject;
      notifierId: string;
      target: null;
    };

export enum NotificationType {
  Reply = "Reply",
  Follow = "Follow",
  Like = "Like",
  Mention = "Mention",
}

export const NotificationTypeOptions = Object.values(NotificationType);
