import Image from "next/image";
import Link from "next/link";
import { UserImage } from "./user-image";
import { SpotifyLink } from "./spotify-link";
import type { PlaylistObject } from "~/models/playlist.model";

export function PlaylistDisplay({ playlist }: { playlist: PlaylistObject }) {
  return (
    <div className="flex flex-col gap-2 bg-container p-2">
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
    </div>
  );
}
