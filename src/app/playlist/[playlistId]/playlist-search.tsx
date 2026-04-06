import type { ChangeEvent } from "react";
import { SearchView } from "~/components/search-view";
import { Sorter } from "~/components/sorter";

import {
  TracksSortingColumn,
  TracksSortingColumnOptions,
} from "~/models/track.model";

export function PlaylistSearch({
  sortingColumn,
  reversed,
  filter,
  sortColumn,
  reverse,
  filterTracks,
  count,
}: {
  sortingColumn: TracksSortingColumn | undefined;
  reversed: boolean;
  filter: string;
  count: number;
  sortColumn: (value: string) => void;
  reverse: () => void;
  filterTracks: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 bg-secondary p-2">
      <div className="flex items-center justify-between gap-2 md:w-fit">
        <Sorter
          title="Sort by"
          onSelect={sortColumn}
          value={sortingColumn ?? TracksSortingColumn.AddedAt}
          options={TracksSortingColumnOptions}
          reversed={reversed}
          reverse={reverse}
        />
      </div>
      <div className="flex">
        <SearchView value={filter} onChange={filterTracks} />
      </div>
    </div>
  );
}
