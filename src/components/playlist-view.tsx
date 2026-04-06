import Image from "next/image";
import Link from "next/link";
import { SpotifyLink } from "~/components/spotify-link";
import { cn } from "~/lib/utils";
import type { PlaylistObject } from "~/models/playlist.model";
import { MessageSquare } from "lucide-react";
import { LikeButton } from "./buttons/like-button";
import { unlikePlaylist } from "~/server/unlike-playlist";
import { likePlaylist } from "~/server/like-playlist";
import { ShareButton } from "./buttons/share-button";
import { IconButton } from "./buttons/icon-button";

export function PlaylistView({
  playlist,
  sessionUserId,
  isPrimaryColor = false,
}: {
  sessionUserId?: string | null;
  playlist: PlaylistObject;
  focused?: boolean;
  isPrimaryColor?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md p-1 md:gap-2 md:p-2",
        isPrimaryColor ? "bg-primary-accent" : "bg-secondary",
      )}
    >
      <div className="flex items-start gap-2 font-bold">
        <Link
          href={`/playlist/${playlist.id}`}
          className="flex grow gap-2 overflow-x-hidden"
          title={playlist.name}
        >
          <Image
            width={96}
            height={96}
            className="inline aspect-square h-16 w-16 flex-shrink-0 flex-grow-0 rounded-md md:h-24 md:w-24"
            src={playlist.image}
            alt={playlist.name}
          />

          <div className="flex h-full grow flex-col items-start truncate">
            <div className="flex items-center justify-between text-wrap font-bold">
              <span className="truncate text-base md:text-xl">
                {playlist.name}
              </span>

              {playlist.likes && playlist.likes.length !== 0 && (
                <>
                  <div className="whitespace-pre text-sm font-normal md:text-base">
                    {" · "}
                  </div>
                  <Link
                    className="inline grow items-center text-sm font-normal hover:underline md:text-base"
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
              <div className="text-wrap text-sm font-light md:text-base">
                {playlist.description.length > 53
                  ? `${playlist.description.substring(0, 50)}...`
                  : playlist.description}
              </div>
            )}
            <div className="inline items-center text-xs font-bold text-background md:text-sm">
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
            <IconButton>
              <MessageSquare />
            </IconButton>
            <div>{playlist.replies?.length ?? 0}</div>
          </Link>
        </div>
        <ShareButton path={`/playlist/${playlist.id}`} />
      </div>
    </div>
  );
}
