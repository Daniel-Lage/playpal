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
  disabled,
  sortColumn,
  reverse,
  filterTracks,
  play,
}: {
  sortingColumn: TracksSortingColumn | undefined;
  reversed: boolean | undefined;
  filter: string;
  disabled: boolean;
  sortColumn: (e: ChangeEvent<HTMLSelectElement>) => void;
  reverse: () => void;
  filterTracks: (e: ChangeEvent<HTMLInputElement>) => void;
  play: (start?: PlaylistTrack | undefined) => void;
}) {
  return (
    <div className="bg-main-2 flex flex-col items-center justify-between gap-2 p-2 md:flex-row">
      <div className="flex gap-2">
        <div className="bg-main-3 flex items-center justify-center gap-2 rounded-xl pl-1 pr-3 text-center">
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

      <button disabled={disabled} onClick={() => play()}>
        <Image height={32} width={32} src="/play.png" alt="play icon" />
      </button>
    </div>
  );
}
