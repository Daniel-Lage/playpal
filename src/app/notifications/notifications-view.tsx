"use client";

import Link from "next/link";
import { useState } from "react";
import { TabLinkButton } from "~/components/buttons/tab-link-button";
import { ItemsView } from "~/components/items-view";
import { PostView } from "~/components/post-view";
import { UserImage } from "~/components/user-image";
import { formatTimelapse } from "~/helpers/format-timelapse";
import {
  type NotificationObject,
  NotificationType,
  NotificationTypeOptions,
} from "~/models/notifications.model";
import type { PlaylistObject } from "~/models/playlist.model";
import type { PostObject } from "~/models/post.model";
import type { UserObject } from "~/models/user.model";

export default function NotificationsView({
  notifications,
  sessionUserId,
}: {
  notifications: NotificationObject[];
  sessionUserId?: string | null;
}) {
  const [tab, setTab] = useState<NotificationType | undefined>();

  return (
    <>
      <div className="flex flex-col bg-secondary p-2">
        <div className="grid grid-cols-4 gap-1">
          <TabLinkButton
            className={tab == null ? "bg-secondary-accent" : "bg-secondary"}
            onClick={() => setTab(undefined)}
          >
            All
          </TabLinkButton>
          {NotificationTypeOptions.map((type) => (
            <TabLinkButton
              className={tab === type ? "bg-secondary-accent" : "bg-secondary"}
              onClick={() => setTab(type)}
              key={type}
            >
              {type}
            </TabLinkButton>
          ))}
        </div>
      </div>
      <ItemsView>
        {notifications
          .filter((notification) =>
            tab != null ? notification.type === tab : true,
          )
          .map((notification) => (
            <div
              key={
                notification.target
                  ? notification.notifierId + notification.target.id
                  : notification.notifierId
              }
              className="flex flex-col rounded-md bg-secondary"
            >
              <NotificationView
                notification={notification}
                timelapse={
                  formatTimelapse(
                    Date.now() - notification.createdAt.getTime(),
                  ) ?? notification.createdAt.toUTCString()
                }
                sessionUserId={sessionUserId}
              />
            </div>
          ))}
      </ItemsView>
    </>
  );
}

function NotificationView({
  notification,
  timelapse,
  sessionUserId,
}: {
  notification: NotificationObject;
  timelapse: string;
  sessionUserId?: string | null;
}) {
  if (notification.type === NotificationType.Reply)
    return (
      <PostView
        post={notification.notifier as PostObject}
        sessionUserId={sessionUserId}
        isMainPost={false}
      />
    );

  if (notification.type === NotificationType.Follow)
    return (
      <NFollowView
        notifier={notification.notifier as UserObject}
        timelapse={timelapse}
      />
    );

  if (notification.type === NotificationType.Like)
    return (
      <NLikeView
        notifier={notification.notifier as UserObject}
        timelapse={timelapse}
        target={notification.target!}
      />
    );

  if (notification.type === NotificationType.Mention)
    return (
      <PostView
        post={notification.notifier as PostObject}
        sessionUserId={sessionUserId}
        isMainPost={false}
      />
    );
}

function NFollowView({
  notifier,
  timelapse,
}: {
  notifier: UserObject;
  timelapse: string;
}) {
  return (
    <Link className="flex items-center gap-2 p-2" href={`/user/${notifier.id}`}>
      <UserImage size={32} image={notifier.image} name={notifier.name} />

      <div>
        <span className="font-bold">{notifier.name}</span> followed you
        {" " + timelapse}
      </div>
    </Link>
  );
}

function NLikeView({
  notifier,
  timelapse,
  target,
}: {
  notifier: UserObject;
  timelapse: string;
  target: PostObject | PlaylistObject;
}) {
  return (
    <>
      <Link
        className="flex items-center gap-2 p-2"
        href={`/user/${notifier.id}`}
      >
        <UserImage size={32} image={notifier.image} name={notifier.name} />
        <div>
          <span className="font-bold">{notifier.name}</span> liked your{" "}
          {"content" in target ? "post" : "playlist"}
          {" " + timelapse}
        </div>
      </Link>
      <Link className="flex items-center p-2" href={`/post/${target.id}`}>
        <div className="text-gray-500">
          {"content" in target ? target.content : target.name}
        </div>
      </Link>
    </>
  );
}
