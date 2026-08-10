"use client";

import Link from "next/link";
import { useState } from "react";
import { TabLinkButton } from "~/components/buttons/tab-link-button";
import { ItemsView } from "~/components/items-view";
import { PlaylistView } from "~/components/playlist-view";
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
      <div className="bg-container flex flex-col border-b p-2">
        <div className="grid grid-cols-5 place-content-center gap-1">
          <TabLinkButton
            className={tab == null ? "border" : ""}
            onClick={() => setTab(undefined)}
          >
            All
          </TabLinkButton>
          {NotificationTypeOptions.map((type) => (
            <TabLinkButton
              className={tab === type ? "border" : ""}
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
              className="flex flex-col rounded-md"
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
  switch (notification.type) {
    case NotificationType.Reply:
      return (
        <PostView
          post={notification.notifier}
          sessionUserId={sessionUserId}
          isMainPost={false}
        />
      );
    case NotificationType.Follow:
      return (
        <NFollowView notifier={notification.notifier} timelapse={timelapse} />
      );
    case NotificationType.Like:
      if ("content" in notification.target)
        return (
          <NPostLikeView
            notifier={notification.notifier}
            timelapse={timelapse}
            target={notification.target}
          />
        );
      return (
        <NPlaylistLikeView
          notifier={notification.notifier}
          timelapse={timelapse}
          target={notification.target}
        />
      );
    case NotificationType.Mention:
      return (
        <PostView
          post={notification.notifier}
          sessionUserId={sessionUserId}
          isMainPost={false}
        />
      );
  }
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

function NPostLikeView({
  notifier,
  timelapse,
  target,
}: {
  notifier: UserObject;
  timelapse: string;
  target: PostObject;
}) {
  return (
    <>
      <Link
        className="flex items-center gap-2 p-2"
        href={`/user/${notifier.id}`}
      >
        <UserImage size={32} image={notifier.image} name={notifier.name} />
        <div>
          <span className="font-bold">{notifier.name}</span> liked your post
          {" " + timelapse}
        </div>
      </Link>
      <PostView post={target} isMainPost={false} />
    </>
  );
}
function NPlaylistLikeView({
  notifier,
  timelapse,
  target,
}: {
  notifier: UserObject;
  timelapse: string;
  target: PlaylistObject;
}) {
  return (
    <>
      <Link
        className="flex items-center gap-2 p-2"
        href={`/user/${notifier.id}`}
      >
        <UserImage size={32} image={notifier.image} name={notifier.name} />
        <div>
          <span className="font-bold">{notifier.name}</span> liked your playlist
          {" " + timelapse}
        </div>
      </Link>
      <PlaylistView playlist={target} />
    </>
  );
}
