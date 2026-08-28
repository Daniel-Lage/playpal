"use client";

import { LoaderCircle, Play, Shuffle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IconButton } from "~/components/buttons/icon-button";
import { LikeButton } from "~/components/buttons/like-button";
import { PlayButton } from "~/components/buttons/play-button";
import { ShareButton } from "~/components/buttons/share-button";
import { SpotifyLink } from "~/components/spotify-link";
import { UserImage } from "~/components/user-image";
import type { PlaylistObject } from "~/models/playlist.model";
import type { PlaylistTrack } from "~/models/track.model";
import { likePlaylist } from "~/server/like-playlist";
import { unlikePlaylist } from "~/server/unlike-playlist";
import { RepliesButton } from "./buttons/replies-button";
import { ActionStatus } from "~/models/status.model";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

export function PlaylistContent({
  playlist,
  sessionUserId,
  disabled,
  shuffled,
  switchShuffled,
  play,
  isLikedSongs = false,
  status,
}: {
  playlist: PlaylistObject;
  disabled: boolean;
  sessionUserId?: string;
  shuffled: boolean;
  switchShuffled: () => void;
  play: (start?: PlaylistTrack) => void;
  isLikedSongs?: boolean;
  status: ActionStatus;
}) {
  const [isOffScreen, setIsOffScreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOffScreen(!entry?.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      },
    );

    observer.observe(content);

    return () => {
      if (content) {
        observer.unobserve(content);
      }
    };
  }, []);

  return (
    <>
      <div
        className="flex flex-col gap-2 border-b bg-container p-2"
        ref={contentRef}
      >
        <div className="flex flex-col items-center gap-2 md:flex-row md:items-stretch">
          <Image
            width={160}
            height={160}
            className="mt-9 aspect-square h-auto w-56 flex-shrink-0 flex-grow-0 rounded-md md:mt-0"
            src={playlist.image}
            alt={playlist.name}
          />
          <div className="flex w-full flex-col">
            <div className="flex w-full gap-2">
              <div className="flex h-full grow flex-col items-start gap-1 truncate">
                <div className="flex items-start justify-between text-wrap text-2xl font-bold">
                  {playlist.name}
                </div>
                <div className="text-wrap text-sm font-light md:text-base">
                  {playlist.description}
                </div>
                <div className="text-wrap text-xs md:text-base">
                  {playlist.totalTracks} tracks
                </div>

                <div className="flex gap-2">
                  <UserImage
                    size={24}
                    image={playlist.owner.image}
                    name={playlist.owner.name}
                  />
                  <Link
                    className="inline items-center font-bold text-muted-foreground hover:underline"
                    href={`/users/${playlist.owner.id}`}
                  >
                    {playlist.owner?.name}
                  </Link>
                </div>
              </div>

              <SpotifyLink external_url={playlist.externalUrl} />
            </div>
          </div>
        </div>

        <div className="flex grow items-end gap-4 rounded-md">
          <PlayButton disabled={disabled} onClick={() => play()}>
            {status === ActionStatus.Active ? (
              <LoaderCircle
                stroke="var(--primary-foreground)"
                className="animate-spin"
              />
            ) : (
              <Play
                fill="var(--primary-foreground)"
                stroke="var(--primary-foreground)"
              />
            )}
          </PlayButton>

          <IconButton
            big
            onClick={switchShuffled}
            className={
              shuffled ? "[&_svg]:stroke-primary" : "[&_svg]:stroke-foreground"
            }
          >
            <Shuffle className="drop-shadow-md" />
          </IconButton>
          <div className="grid w-full grid-cols-3">
            {!isLikedSongs && (
              <>
                <LikeButton
                  big
                  hasLike={
                    !!playlist.likes?.some(
                      (like) => like.userId === sessionUserId,
                    )
                  }
                  count={playlist.likes?.length ?? 0}
                  sessionUserId={sessionUserId}
                  unlike={(suid: string) => unlikePlaylist(playlist.id, suid)}
                  like={(suid: string) => likePlaylist(playlist.id, suid)}
                  href={`/playlists/${playlist.id}/likes`}
                />

                <RepliesButton
                  big
                  count={playlist.replies?.length ?? 0}
                  href={`/playlists/${playlist.id}/replies`}
                />

                <div className="flex items-center justify-end">
                  <ShareButton big path={`/playlists/${playlist.id}`} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div
        className={cn(
          "sticky top-0 flex h-0 items-center gap-2 overflow-hidden bg-container transition-none duration-100 ease-in-out",
          isOffScreen &&
            "h-16 gap-2 border-b px-4 transition-[height] md:h-20 md:gap-4",
        )}
      >
        <PlayButton disabled={disabled} onClick={() => play()}>
          {status === ActionStatus.Active ? (
            <LoaderCircle
              stroke="var(--primary-foreground)"
              className="animate-spin"
            />
          ) : (
            <Play
              fill="var(--primary-foreground)"
              stroke="var(--primary-foreground)"
            />
          )}
        </PlayButton>
        <IconButton
          big
          onClick={switchShuffled}
          className={
            shuffled ? "[&_svg]:stroke-primary" : "[&_svg]:stroke-foreground"
          }
        >
          <Shuffle className="drop-shadow-md" />
        </IconButton>
        <Image
          width={40}
          height={40}
          className="aspect-square h-auto w-10 flex-shrink-0 flex-grow-0 rounded-md"
          src={playlist.image}
          alt={playlist.name}
        />
        <div className="flex items-start justify-between text-wrap text-2xl font-bold">
          {playlist.name}
        </div>
      </div>
    </>
  );
}
