import type { PlaylistsSortingColumn } from "~/models/playlist.model";
import type { PostsSortingColumn } from "~/models/post.model";
import type { TracksSortingColumn } from "~/models/track.model";

export function stringifyBooleanCookie(text: boolean | null): string {
  return text === true ? "true" : "false";
}

export function stringifyPostsSortingColumnCookie(
  value: PostsSortingColumn | null,
): string {
  if (value === null) {
    return "";
  }
  return value;
}

export function stringifyTracksSortingColumnCookie(
  value: TracksSortingColumn | null,
): string {
  if (value === null) {
    return "";
  }
  return value;
}

export function stringifyPlaylistsSortingColumnCookie(
  value: PlaylistsSortingColumn | null,
): string {
  if (value === null) {
    return "";
  }
  return value;
}
