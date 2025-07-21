import type { ChangeEvent } from "react";
import { SearchView } from "~/components/search-view";
import { Sorter } from "~/components/sorter";
import {
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
}: {
  sortingColumn: PlaylistsSortingColumn | undefined;
  reversed: boolean;
  filter: string;
  length: number;
  sortColumn: (value: string) => void;
  reverse: () => void;
  filterPlaylists: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-md bg-primary p-2 md:flex-row md:items-center">
      {length} Playlists
      <Sorter
        title="Sort by"
        onSelect={sortColumn}
        value={sortingColumn ?? PlaylistsSortingColumn.CreatedAt}
        options={PlaylistsSortingColumnOptions}
        reversed={reversed}
        reverse={reverse}
      />
      <SearchView value={filter} onChange={filterPlaylists} />
    </div>
  );
}
