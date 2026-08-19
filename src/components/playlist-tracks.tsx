import { ItemsView } from "~/components/views/items-view";
import { TrackView } from "~/components/views/track-view";
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
    <ItemsView>
      {treatedTracks.map((track) => (
        <TrackView
          key={`${track.track.id}:${track.added_at}`}
          track={track}
          disabled={disabled}
          onClick={() => playTrack(track)}
        />
      ))}
    </ItemsView>
  );
}
