import Image from "next/image";
import Link from "next/link";
import { SpotifyLink } from "~/components/spotify-link";
import { cn } from "~/lib/utils";
import type { PlaylistObject } from "~/models/playlist.model";
import { Button } from "./ui/button";
import { MessageSquare } from "lucide-react";
import { LikeButton } from "./like-button";
import { unlikePlaylist } from "~/server/unlike-playlist";
import { likePlaylist } from "~/server/like-playlist";
import { ShareButton } from "./share-button";

export function PlaylistView({
  playlist,
  focused = false,
  sessionUserId,
}: {
  sessionUserId?: string | null;
  playlist: PlaylistObject;
  focused?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-secondary p-2">
      <div
        className={cn(
          "flex items-start gap-2 font-bold",
          focused ? "bg-primary" : "bg-secondary",
        )}
      >
        <Link
          href={`/playlist/${playlist.id}`}
          className="flex grow gap-2"
          title={playlist.name}
        >
          <Image
            width={100}
            height={100}
            className="inline aspect-square h-[100px] w-[100px] shrink-0 grow-0 rounded-sm"
            src={playlist.image}
            alt={playlist.name}
          />

          <div className="flex h-full grow flex-col items-start gap-1 truncate">
            <div className="flex items-center justify-between text-wrap text-3xl font-bold">
              {playlist.name}

              {playlist.likes && playlist.likes.length !== 0 && (
                <>
                  <div className="whitespace-pre text-base font-normal">
                    {" · "}
                  </div>
                  <Link
                    className="inline grow items-center text-base font-normal hover:underline"
                    href={`/post/${playlist.id}`}
                  >
                    Liked by{" "}
                    {playlist.likes
                      .slice(0, 2)
                      .map((like) => like.liker?.name)
                      .join(", ")}{" "}
                    {playlist.likes.length > 2 &&
                      `and ${playlist.likes.length - 1} more...`}
                  </Link>
                </>
              )}
            </div>
            {!!playlist.description && (
              <div className="text-wrap font-light">{playlist.description}</div>
            )}
            <div className="inline items-center font-bold">
              {playlist.owner?.name}
            </div>
          </div>
        </Link>

        <SpotifyLink external_url={playlist.externalUrl} />
      </div>
      <div className="flex grow items-end gap-4 rounded-md">
        <div className="grid w-full grid-cols-2">
          <LikeButton
            hasLike={
              !!playlist.likes?.some((like) => like.userId === sessionUserId)
            }
            count={playlist.likes?.length ?? 0}
            sessionUserId={sessionUserId}
            unlike={(suid: string) => unlikePlaylist(playlist.id, suid)}
            like={(suid: string) => likePlaylist(playlist.id, suid)}
            href={`/playlist/${playlist.id}`}
          />

          <Link
            className="flex cursor-pointer items-center gap-2 hover:underline"
            href={`/playlist/${playlist.id}`}
          >
            <Button size="icon">
              <MessageSquare />
            </Button>
            <div>{playlist.replies?.length ?? 0}</div>
          </Link>
        </div>
        <ShareButton path={`/playlist/${playlist.id}`} />
      </div>
    </div>
  );
}
