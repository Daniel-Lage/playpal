import Image from "next/image";
import type { PlaylistTrack } from "~/models/track.model";
import { SpotifyLink } from "./spotify-link";

export function TrackView({
  track,
  disabled,
  onClick,
}: {
  track: PlaylistTrack;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      key={track.track.uri + track.added_at}
      className="flex w-full items-center gap-1 rounded-md bg-secondary p-1 font-bold"
      disabled={disabled || track.is_local}
      onClick={onClick}
    >
      {track.track.album.images[0]?.url ? (
        <Image
          width={40}
          height={40}
          className="aspect-square h-auto w-10 flex-shrink-0 flex-grow-0 rounded-md"
          src={track.track.album.images[0]?.url ?? ""}
          alt={track.track.album.name}
        />
      ) : (
        <div className="h-10 w-10 rounded-md bg-black" />
      )}
      <div className="grow overflow-hidden">
        <div className="flex grow overflow-hidden">
          <div className="w-full truncate text-left text-sm md:w-1/2">
            {track.track.name}
          </div>
          <div className="w-0 truncate text-left text-sm md:w-1/2">
            {track.track.album.name}
          </div>
        </div>
        <div className="truncate text-left text-xs">
          {track.track.artists.map((artist) => artist.name).join(", ")}
        </div>
      </div>
      {!!track.track.external_urls?.spotify && (
        <SpotifyLink external_url={track.track.external_urls.spotify} />
      )}
    </button>
  );
}
