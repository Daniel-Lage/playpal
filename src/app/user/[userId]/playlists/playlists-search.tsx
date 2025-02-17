import Image from "next/image";
import type { ChangeEvent } from "react";
import {
  PlaylistFeedStyle,
  PlaylistFeedStyleOptions,
  PlaylistsSortingColumn,
  PlaylistsSortingColumnOptions,
} from "~/models/playlist.model";

export function PlaylistsSearch({
  sortingColumn,
  reversed,
  filter,
  length,
  sortColumn,
  reverse,
  filterPlaylists,
  changeStyle,
}: {
  sortingColumn: PlaylistsSortingColumn | undefined;
  reversed: boolean | undefined;
  filter: string;
  length: number;
  sortColumn: (e: ChangeEvent<HTMLSelectElement>) => void;
  reverse: () => void;
  filterPlaylists: (e: ChangeEvent<HTMLInputElement>) => void;
  changeStyle: (e: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-md bg-main-1 p-2 md:flex-row md:items-center">
      {length} Playlists
      <div className="flex items-center justify-center gap-2 rounded-md bg-main-3 p-2 text-center text-sm">
        <div className="font-bold">Sorting column</div>
        <select
          onChange={sortColumn}
          defaultValue={sortingColumn ?? PlaylistsSortingColumn.CreatedAt}
        >
          {PlaylistsSortingColumnOptions.map((sortingColumn) => (
            <option key={sortingColumn}>{sortingColumn}</option>
          ))}
        </select>

        <button onClick={reverse} className="my-[-10px]">
          <Image
            height={32}
            width={32}
            src="/direction.png"
            alt="direction icon"
            className={reversed ? "rotate-180" : ""}
          />
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 rounded-md bg-main-3 p-2 text-center text-sm">
        <div className="font-bold">Feed Style</div>
        <select
          onChange={changeStyle}
          defaultValue={sortingColumn ?? PlaylistFeedStyle.Compact}
        >
          {PlaylistFeedStyleOptions.map((PlaylistFeedStyle) => (
            <option key={PlaylistFeedStyle}>{PlaylistFeedStyle}</option>
          ))}
        </select>
      </div>
      <input
        placeholder="Search something!"
        className="grow bg-transparent placeholder-zinc-600 outline-none"
        type="text"
        value={filter}
        onChange={filterPlaylists}
      />
    </div>
  );
}
