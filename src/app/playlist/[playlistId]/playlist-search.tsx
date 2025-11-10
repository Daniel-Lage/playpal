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
    <div className="flex shrink-0 flex-col items-center justify-between gap-2 bg-primary p-2 md:mx-[19vw] md:flex-row">
      <div className="shrink-0">{count} Tracks</div>
      <div className="flex w-full items-center justify-between gap-2 md:w-fit">
        <Sorter
          title="Sort by"
          onSelect={sortColumn}
          value={sortingColumn ?? TracksSortingColumn.AddedAt}
          options={TracksSortingColumnOptions}
          reversed={reversed}
          reverse={reverse}
        />
      </div>
      <div className="flex w-full">
        <SearchView value={filter} onChange={filterTracks} />
      </div>
    </div>
  );
}
