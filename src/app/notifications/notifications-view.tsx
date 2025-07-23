"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PostView } from "~/components/post-view";
import { Button } from "~/components/ui/button";
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
  sessionUserId?: string | null | undefined;
}) {
  const [tab, setTab] = useState<NotificationType | undefined>();

  return (
    <>
      <div className="flex flex-col rounded-md bg-primary p-2 text-xl">
        <h1 className="p-2 text-xl font-bold">Notifications</h1>
        <div className="grid grid-cols-4 gap-1">
          <Button
            variant="link"
            size="tab"
            className={tab === undefined ? "bg-primary-accent" : "bg-primary"}
            onClick={() => setTab(undefined)}
          >
            All
          </Button>
          {NotificationTypeOptions.map((type) => (
            <Button
              key={type}
              variant="link"
              size="tab"
              className={tab === type ? "bg-primary-accent" : "bg-primary"}
              onClick={() => setTab(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      {notifications
        .filter((notification) =>
          tab !== undefined ? notification.type === tab : true,
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
  sessionUserId?: string | null | undefined;
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
      <Image
        width={32}
        height={32}
        className="aspect-square h-8 w-8 shrink-0 grow-0 rounded-full"
        src={notifier.image ?? ""}
        alt={notifier.name ?? ""}
      />

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
        <Image
          width={32}
          height={32}
          className="aspect-square h-8 w-8 shrink-0 grow-0 rounded-full"
          src={notifier.image ?? ""}
          alt={notifier.name ?? ""}
        />

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
