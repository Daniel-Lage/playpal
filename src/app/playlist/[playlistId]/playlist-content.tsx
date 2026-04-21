"use client";

import { Play, Shuffle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { IconButton } from "~/components/buttons/icon-button";
import { LikeButton } from "~/components/buttons/like-button";
import { PlayButton } from "~/components/buttons/play-button";
import { ShareButton } from "~/components/buttons/share-button";
import { SpotifyLink } from "~/components/spotify-link";
import { UserImage } from "~/components/user-image";
import type { PlaylistObject } from "~/models/playlist.model";
import { PlaylistTab } from "~/models/playlist.model";
import type { PlaylistTrack } from "~/models/track.model";
import { likePlaylist } from "~/server/like-playlist";
import { unlikePlaylist } from "~/server/unlike-playlist";

export function PlaylistContent({
  playlist,
  sessionUserId,
  disabled,
  shuffled,
  switchShuffled,
  play,
  tab,
  setTab,
}: {
  playlist: PlaylistObject;
  disabled: boolean;
  sessionUserId?: string;
  shuffled: boolean;
  switchShuffled: () => void;
  play: (start?: PlaylistTrack) => void;
  tab: PlaylistTab;
  setTab: (value: PlaylistTab | ((prev: PlaylistTab) => PlaylistTab)) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b-2 border-background bg-secondary p-2">
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
                  className="inline items-center font-bold text-background hover:underline"
                  href={`/user/${playlist.owner.id}`}
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
          <Play fill="black" stroke="black" />
        </PlayButton>

        <IconButton
          big
          onClick={switchShuffled}
          className={
            shuffled ? "[&_svg]:stroke-primary-accent" : "[&_svg]:stroke-black"
          }
        >
          <Shuffle className="drop-shadow-md" />
        </IconButton>
        <div className="grid w-full grid-cols-2">
          <LikeButton
            big
            hasLike={
              !!playlist.likes?.some((like) => like.userId === sessionUserId)
            }
            count={playlist.likes?.length ?? 0}
            sessionUserId={sessionUserId}
            unlike={(suid: string) => unlikePlaylist(playlist.id, suid)}
            like={(suid: string) => likePlaylist(playlist.id, suid)}
            onClick={() =>
              tab === PlaylistTab.Likes
                ? setTab(PlaylistTab.Tracks)
                : setTab(PlaylistTab.Likes)
            }
          />
        </div>
        <ShareButton big path={`/playlist/${playlist.id}`} />
      </div>
    </div>
  );
}
