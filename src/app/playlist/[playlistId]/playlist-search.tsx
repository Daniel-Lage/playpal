import { Play } from "lucide-react";
import type { ChangeEvent } from "react";
import { SearchView } from "~/components/search-view";
import { Sorter } from "~/components/sorter";
import { Button } from "~/components/ui/button";

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
  reversed: boolean;
  filter: string;
  disabled: boolean;
  sortColumn: (value: string) => void;
  reverse: () => void;
  filterTracks: (e: ChangeEvent<HTMLInputElement>) => void;
  play: (start?: PlaylistTrack | undefined) => void;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-between gap-2 rounded-md bg-primary p-2 md:flex-row">
      <div className="flex w-full items-center justify-between gap-2 md:w-fit">
        <Button
          disabled={disabled}
          onClick={() => play()}
          size="bigicon"
          variant="play"
        >
          <Play fill="black" stroke="black" />
        </Button>

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
