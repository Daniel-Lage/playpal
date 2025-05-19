import type { ChangeEvent } from "react";
import { SearchView } from "~/components/search-view";
import { Select } from "~/components/select";
import { Sorter } from "~/components/sorter";
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
  reversed: boolean;
  filter: string;
  length: number;
  sortColumn: (value: string) => void;
  reverse: () => void;
  filterPlaylists: (e: ChangeEvent<HTMLInputElement>) => void;
  changeStyle: ((value: string) => void) | undefined;
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
      <div className="rounded-md border-2 border-primary-accent">
        <Select
          title="Feed Style"
          onSelect={changeStyle}
          value={sortingColumn ?? PlaylistFeedStyle.Compact}
          options={PlaylistFeedStyleOptions}
        />
      </div>
      <SearchView value={filter} onChange={filterPlaylists} />
    </div>
  );
}
