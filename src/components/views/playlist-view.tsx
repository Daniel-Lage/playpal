import Image from "next/image";
import Link from "next/link";
import { SpotifyLink } from "~/components/spotify-link";
import type { PlaylistObject } from "~/models/playlist.model";
import { LikeButton } from "../buttons/like-button";
import { unlikePlaylist } from "~/server/unlike-playlist";
import { likePlaylist } from "~/server/like-playlist";
import { ShareButton } from "../buttons/share-button";
import { cn } from "~/lib/utils";
import { RepliesButton } from "../buttons/replies-button";

export function PlaylistView({
  playlist,
  sessionUserId,
  focused,
}: {
  sessionUserId?: string | null;
  playlist: PlaylistObject;
  focused?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md border bg-container p-1 md:gap-2 md:p-2",
        focused && "rounded-none border-none",
      )}
    >
      <div className="flex items-start gap-2 font-bold">
        <Link
          href={`/playlists/${playlist.id}`}
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

              {playlist.likes && playlist.likes.length > 0 && (
                <>
                  <div className="whitespace-pre text-sm font-normal md:text-base">
                    {" · "}
                  </div>
                  <Link
                    className="inline grow items-center text-sm font-normal hover:underline md:text-base"
                    href={`/playlists/${playlist.id}`}
                  >
                    Liked by{" "}
                    {playlist.likes
                      .slice(0, 2)
                      .map((like) => like.liker?.name)
                      .join(", ")}{" "}
                    {playlist.likes.length > 2 &&
                      `and ${playlist.likes.length - 2} more...`}
                  </Link>
                </>
              )}
            </div>
            <div className="text-wrap text-sm font-light md:text-base">
              {playlist.totalTracks} tracks
            </div>
            {!!playlist.description && (
              <div className="text-wrap text-sm font-light md:text-base">
                {playlist.description.length > 53
                  ? `${playlist.description.substring(0, 50)}...`
                  : playlist.description}
              </div>
            )}
            <div className="inline items-center text-xs font-bold text-muted-foreground md:text-sm">
              {playlist.owner?.name}
            </div>
          </div>
        </Link>

        <SpotifyLink external_url={playlist.externalUrl} />
      </div>
      <div className="flex grow items-end gap-4 rounded-md">
        <div className="grid w-full grid-cols-3">
          <LikeButton
            hasLike={
              !!playlist.likes?.some((like) => like.userId === sessionUserId)
            }
            count={playlist.likes?.length ?? 0}
            sessionUserId={sessionUserId}
            unlike={(suid: string) => unlikePlaylist(playlist.id, suid)}
            like={(suid: string) => likePlaylist(playlist.id, suid)}
            href={`/playlists/${playlist.id}`}
          />

          <RepliesButton
            count={playlist.replies?.length ?? 0}
            href={`/playlists/${playlist.id}/replies`}
          />

          <div className="flex items-center justify-end">
            <ShareButton path={`/playlists/${playlist.id}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
