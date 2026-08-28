import type { ChangeEvent } from "react";
import { SearchView } from "~/components/views/search-view";

export function PlaylistSearch({
  filter,
  filterTracks,
}: {
  filter: string;
  filterTracks: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="p-4 pb-0">
      <SearchView value={filter} onChange={filterTracks} />
    </div>
  );
}
