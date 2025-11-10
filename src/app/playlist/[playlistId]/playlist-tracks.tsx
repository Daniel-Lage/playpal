import Image from "next/image";
import { MainContentView } from "~/components/main-content-view";
import { SpotifyLink } from "~/components/spotify-link";
import type { PlaylistTrack } from "~/models/track.model";

export function PlaylistTracks({
  treatedTracks,
  disabled,
  playTrack,
}: {
  treatedTracks: PlaylistTrack[];
  disabled: boolean;
  playTrack: (track: PlaylistTrack) => void;
}) {
  return (
    <MainContentView>
      {treatedTracks.map((track) => (
        <button
          key={track.track.uri + track.added_at}
          className="flex w-full items-center gap-1 rounded-md bg-secondary p-1 font-bold"
          disabled={disabled || track.is_local}
          onClick={() => playTrack(track)}
        >
          {track.track.album.images[0]?.url ? (
            <Image
              width={40}
              height={40}
              className="rounded-md"
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
      ))}
    </MainContentView>
  );
}
