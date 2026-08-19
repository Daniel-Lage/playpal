import {
  PlaylistsSortingColumn,
  PlaylistsSortingColumnOptions,
} from "~/models/playlist.model";
import {
  PostsSortingColumn,
  PostsSortingColumnOptions,
} from "~/models/post.model";
import {
  TracksSortingColumn,
  TracksSortingColumnOptions,
} from "~/models/track.model";

export function parseBooleanCookie(text: string | null | undefined): boolean {
  return text === "true";
}

export function parsePostsSortingColumnCookie(
  text: string | null | undefined,
): PostsSortingColumn {
  if (PostsSortingColumnOptions.some((psco) => psco === text)) {
    return text as PostsSortingColumn;
  }

  return PostsSortingColumn.CreatedAt;
}

export function parseTracksSortingColumnCookie(
  text: string | null | undefined,
): TracksSortingColumn {
  if (TracksSortingColumnOptions.some((tsco) => tsco === text)) {
    return text as TracksSortingColumn;
  }
  return TracksSortingColumn.AddedAt;
}

export function parsePlaylistsSortingColumnCookie(
  text: string | null | undefined,
): PlaylistsSortingColumn {
  if (PlaylistsSortingColumnOptions.some((psco) => psco === text)) {
    return text as PlaylistsSortingColumn;
  }
  return PlaylistsSortingColumn.CreatedAt;
}
