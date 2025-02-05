import Image from "next/image";
import Link from "next/link";
import { SpotifyLink } from "~/app/_components/spotify-link";
import { Playlist, PlaylistFeedStyle } from "~/models/playlist.model";

export function PlaylistFeed({
  treatedPlaylists,
  style,
}: {
  treatedPlaylists: Playlist[];
  style: PlaylistFeedStyle;
}) {
  if (style === PlaylistFeedStyle.Grid)
    return (
      <div className="grid grid-cols-2 gap-2 px-2 pt-0 md:grid-cols-4 md:gap-4">
        {treatedPlaylists.map((playlist) => (
          <PlaylistGrid key={playlist.id} playlist={playlist} />
        ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      {treatedPlaylists.map((playlist) =>
        style === PlaylistFeedStyle.Compact ? (
          <PlaylistCompact key={playlist.id} playlist={playlist} />
        ) : (
          <PlaylistRow key={playlist.id} playlist={playlist} />
        ),
      )}
    </div>
  );
}

function PlaylistGrid({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex flex-col items-end justify-between rounded-xl bg-secondary-1 p-2">
      <Link
        href={`/profile/${playlist.owner.id}/playlist/${playlist.id}`}
        className="grow"
        title={playlist.name}
      >
        <Image
          width={500}
          height={500}
          className="aspect-square rounded-lg"
          src={playlist.images[0]?.url ?? ""}
          alt={playlist.name}
        />

        <div className="px-2 pt-2 text-center font-bold">{playlist.name}</div>
      </Link>
      <SpotifyLink size={20} external_url={playlist.external_urls.spotify} />
    </div>
  );
}

function PlaylistCompact({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex items-center gap-2 overflow-hidden bg-secondary-1 p-1 font-bold md:rounded-lg">
      <Link
        href={`/profile/${playlist.owner.id}/playlist/${playlist.id}`}
        className="grow"
        title={playlist.name}
      >
        <div className="grow overflow-hidden">
          <div className="flex grow overflow-hidden">
            <div className="w-full truncate text-left md:w-1/2">
              {playlist.name}
            </div>
            <div className="w-0 truncate text-left md:w-1/2">
              {playlist.owner.display_name}
            </div>
          </div>
        </div>
      </Link>

      <SpotifyLink size={20} external_url={playlist.external_urls.spotify} />
    </div>
  );
}

function PlaylistRow({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex items-start gap-2 bg-secondary-1 p-2 font-bold md:rounded-lg">
      <Link
        href={`/profile/${playlist.owner.id}/playlist/${playlist.id}`}
        className="flex grow gap-2"
        title={playlist.name}
      >
        <Image
          width={100}
          height={100}
          className="aspect-square rounded-md"
          src={playlist.images[0]?.url ?? ""}
          alt={playlist.name}
        />

        <div className="grow overflow-hidden">
          <div className="flex grow overflow-hidden">
            <div className="w-full truncate text-left text-xl md:w-1/2 md:text-2xl">
              {playlist.name}
            </div>
          </div>
          <div className="truncate text-left text-sm">
            Playlist - {playlist.owner.display_name} - {playlist.tracks.total}{" "}
            tracks
          </div>
        </div>
      </Link>

      <SpotifyLink size={32} external_url={playlist.external_urls.spotify} />
    </div>
  );
}
