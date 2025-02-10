import Image from "next/image";
import { SpotifyLink } from "~/app/_components/spotify-link";
import type { Playlist } from "~/models/playlist.model";

export function PlaylistContent({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-main-1 p-2 md:flex-row md:items-start">
      <Image
        width={200}
        height={200}
        className="aspect-square rounded-md"
        src={playlist.images[0]?.url ?? ""}
        alt={playlist.name}
      />

      <div className="flex h-full w-full">
        <div className="flex grow flex-col items-start truncate">
          <div className="flex items-start justify-between text-wrap text-2xl font-bold">
            {playlist.name}
          </div>
          <div className="text-wrap text-sm font-light">
            {playlist.description}
          </div>
          <div className="text-wrap text-sm font-bold">
            {playlist.owner.display_name} - {playlist.tracks.total} songs
          </div>
        </div>

        <SpotifyLink size={32} external_url={playlist.external_urls.spotify} />
      </div>
    </div>
  );
}
