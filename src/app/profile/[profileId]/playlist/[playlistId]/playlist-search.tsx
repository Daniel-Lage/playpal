import Image from "next/image";
import type { ChangeEvent } from "react";
import {
  type PlaylistTrack,
  TracksSortingColumn,
  TracksSortingColumnOptions,
} from "~/models/track.model";

export function PlaylistSearch({
  sortingColumn,
  reversed,
  filter,
  playerReady,
  sortColumn,
  reverse,
  filterTracks,
  play,
}: {
  sortingColumn: TracksSortingColumn | undefined;
  reversed: boolean | undefined;
  filter: string;
  playerReady: boolean;
  sortColumn: (e: ChangeEvent<HTMLSelectElement>) => void;
  reverse: () => void;
  filterTracks: (e: ChangeEvent<HTMLInputElement>) => void;
  play: (start?: PlaylistTrack | undefined) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-2 bg-main2 p-2 md:flex-row">
      <div className="flex gap-2">
        <div className="flex items-center justify-center gap-2 rounded-xl bg-main3 pl-1 pr-3 text-center">
          <div className="font-bold md:p-1">Sort by</div>
          <select
            onChange={sortColumn}
            defaultValue={sortingColumn ?? TracksSortingColumn.AddedAt}
          >
            {TracksSortingColumnOptions.map((sortingColumn) => (
              <option key={sortingColumn}>{sortingColumn}</option>
            ))}
          </select>
        </div>

        <button onClick={reverse}>
          <Image
            height={32}
            width={32}
            src="/direction.png"
            alt="direction icon"
            className={reversed ? "rotate-180" : ""}
          />
        </button>
      </div>

      <input
        placeholder="Search something!"
        className="w-32 grow bg-transparent placeholder-zinc-600 outline-none md:w-48"
        type="text"
        value={filter}
        onChange={filterTracks}
      />

      <button disabled={!playerReady} onClick={() => play()}>
        <Image height={32} width={32} src="/play.png" alt="play icon" />
      </button>
    </div>
  );
}
