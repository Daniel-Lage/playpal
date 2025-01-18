"use client";

import { getMySpotifyUser } from "~/api/get-my-spotify-user";
import { getMyDevices } from "~/api/get-my-devices";
import { getPlaylist } from "~/api/get-playlist";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getTokens } from "~/api/get-tokens";

import {
  TracksSortingColumnOptions,
  TracksSortingColumn,
  type PlaylistTrack,
} from "~/models/track.model";

import type { SimplifiedArtist } from "~/models/artist.model";
import { PlayerStatus, type Playlist } from "~/models/playlist.model";
import { PlaylistContent } from "./playlist-content";
import { PlaylistSearch } from "./playlist-search";
import { PlaylistTracks } from "./playlist-tracks";
import useLocalStorage from "~/hooks/use-local-storage";

export default function PlaylistView({
  sessionUserId,
  // profileId, // to know if the playlist is yours?
  playlistId,
}: {
  sessionUserId: string | null;
  profileId: string;
  playlistId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PlayerStatus>(PlayerStatus.Disabled);

  const [playlist, setPlaylist] = useState<Playlist | undefined>();
  const [queue, setQueue] = useState<PlaylistTrack[]>([]);

  const [filter, setFilter] = useState("");
  const [reversed, setReversed] = useLocalStorage<boolean>(
    `${sessionUserId}:tracks_reversed`,
    false,
    (text) => text === "true",
    (value) => (value ? "true" : "false"),
  );
  const [sortingColumn, setSortingColumn] =
    useLocalStorage<TracksSortingColumn>(
      `${sessionUserId}:tracks_sorting_column`,
      TracksSortingColumn.AddedAt,
      (text) => {
        if (TracksSortingColumnOptions.some((tsco) => tsco === text))
          return text as TracksSortingColumn;
        return null;
      },
      (tsc) => tsc, // already is text so no conversion is needed
    );

  const treatedTracks = useMemo(() => {
    if (!playlist) return [];

    const temp = getTreatedTracks(
      [...playlist.tracks.items],
      sortingColumn,
      filter,
    );

    if (reversed) {
      return temp.reverse();
    }

    return temp;
  }, [playlist, filter, sortingColumn, reversed]);

  useEffect(() => {
    getPlaylist(sessionUserId, playlistId)
      .then((playlist) => {
        setLoading(false);
        setPlaylist(playlist);
        if (playlist)
          setQueue(
            getRandomSample(
              playlist.tracks.items.filter((track) => !track.is_local),
              99,
            ),
          );
      })
      .catch(console.error);

    if (sessionUserId) {
      getMySpotifyUser(sessionUserId)
        .then((spotifyUser) => {
          if (spotifyUser.product === "premium") {
            setStatus(PlayerStatus.Ready);
          }
        })
        .catch(console.error);
    }
  }, [playlistId, sessionUserId]);

  const handlePlay = useCallback(
    async (start?: PlaylistTrack) => {
      if (status !== PlayerStatus.Ready || !sessionUserId)
        // redundant but required
        return;
      setStatus(PlayerStatus.Busy);

      const devices = await getMyDevices(sessionUserId);

      let playingQueue = [...queue];

      if (start) {
        playingQueue = setQueueStart(playingQueue, start);
      }

      if (devices[0]?.id)
        await play(sessionUserId, playingQueue, devices[0]?.id).catch(
          console.error,
        );
      else console.log("ta sem dispositivo mano"); // open little warning error message

      setStatus(PlayerStatus.Ready);
    },
    [status, queue, sessionUserId],
  );

  if (loading) return;

  if (!playlist)
    // playlist was not found
    return <div className="self-center text-xl text-red-500">Error</div>;

  return (
    <>
      <div className="flex flex-col overflow-hidden md:rounded-2xl">
        <PlaylistContent playlist={playlist} />

        <PlaylistSearch
          sortingColumn={sortingColumn}
          reversed={reversed}
          filter={filter}
          playerReady={status === PlayerStatus.Ready}
          sortColumn={(e) => {
            setSortingColumn(e.target.value as TracksSortingColumn);
          }}
          reverse={() => {
            setReversed((prev) => !prev);
          }}
          filterTracks={(e) => setFilter(e.target.value)}
          play={handlePlay}
        />
      </div>

      <PlaylistTracks
        treatedTracks={treatedTracks}
        playerReady={status === PlayerStatus.Ready}
        playTrack={handlePlay}
      />
    </>
  );
}

function getRandomSample<T>(array: Array<T>, limit = Infinity): Array<T> {
  const size = Math.min(array.length, limit); // either the whole array or limit if specified and valid

  const newArray: Array<T> = [];
  const prevArray = [...array];

  for (let index = 0; index < size; index++) {
    const index = Math.floor(Math.random() * prevArray.length);
    const item = prevArray.splice(index, 1)[0];
    if (item) newArray.push(item);
  }

  return newArray;
}

export async function play(
  sessionUserId: string,
  tracks: PlaylistTrack[],
  deviceId: string,
) {
  const tokens = await getTokens(sessionUserId);

  if (!tokens?.access_token) {
    console.log("Tokens: ", tokens);

    throw new Error("Internal Server Error");
  }

  const firstTrack = tracks.shift();

  if (!firstTrack) {
    console.log("Tracks: ", tracks);
    console.log("Shuffled Tracks: ", tracks);

    throw new Error("Empty Track Array");
  }

  const addedToQueue = await fetch(
    "https://api.spotify.com/v1/me/player/queue?" +
      new URLSearchParams({
        uri: firstTrack.track.uri,
        device_id: deviceId,
      }).toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer  ${tokens.access_token}`,
      },
    },
  );

  if (addedToQueue.status != 200) {
    console.log("Response: ", addedToQueue);

    throw new Error(addedToQueue.statusText);
  }

  const skipped = await fetch(
    "https://api.spotify.com/v1/me/player/next?" +
      new URLSearchParams({
        device_id: deviceId,
      }).toString(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer  ${tokens.access_token}`,
      },
    },
  );

  if (skipped.status != 200) {
    console.log("Response: ", skipped);

    throw new Error(skipped.statusText);
  }

  for (let index = 0; index < tracks.length; index++) {
    const track = tracks[index];
    if (track) {
      track.track.disc_number = index;
      fetch(
        "https://api.spotify.com/v1/me/player/queue?" +
          new URLSearchParams({
            uri: track.track.uri,
            device_id: deviceId,
          }).toString(),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer  ${tokens.access_token}`,
          },
        },
      ).catch((e) => {
        console.error(e);
      });
    }
  }
}

function getTreatedTracks(
  tracks: PlaylistTrack[],
  sortingColumn: TracksSortingColumn,
  filter: string,
) {
  return tracks
    .filter(
      (track) =>
        track.track.name.toLowerCase().includes(filter.toLowerCase()) ||
        track.track.album.name.toLowerCase().includes(filter.toLowerCase()) ||
        track.track.artists.some((artist) =>
          artist.name.toLowerCase().includes(filter.toLowerCase()),
        ),
    )
    .sort((trackA, trackB) => {
      let keyA = "";
      let keyB = "";

      if (sortingColumn === TracksSortingColumn.Name) {
        keyA = trackA.track.name.toLowerCase();
        keyB = trackB.track.name.toLowerCase();
      }

      if (sortingColumn === TracksSortingColumn.Album) {
        keyA = trackA.track.album.name.toLowerCase();
        keyB = trackB.track.album.name.toLowerCase();
      }

      if (sortingColumn === TracksSortingColumn.Artists) {
        function getHighestArtist(
          artistA: SimplifiedArtist,
          artistB: SimplifiedArtist,
        ) {
          const keyA = artistA.name.toLowerCase();
          const keyB = artistB.name.toLowerCase();
          if (keyA < keyB) return -1;
          if (keyA > keyB) return 1;
          return 0;
        }

        const artistA =
          trackA.track.artists.length === 1
            ? trackA.track.artists[0]
            : trackA.track.artists.sort(getHighestArtist)[0];

        const artistB =
          trackB.track.artists.length === 1
            ? trackB.track.artists[0]
            : trackB.track.artists.sort(getHighestArtist)[0];

        if (!artistA) return 0;
        if (!artistB) return 0;

        keyA = artistA.name.toLowerCase();
        keyB = artistB.name.toLowerCase();
      }

      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
}

function setQueueStart(
  queue: PlaylistTrack[],
  start: PlaylistTrack,
): PlaylistTrack[] {
  const queueWithFirstTrack = [...queue];

  const trackIndex = queueWithFirstTrack.findIndex(
    (other) => other.track.uri === start.track.uri,
  );

  void queueWithFirstTrack.splice(trackIndex, 1)[0];

  queueWithFirstTrack.unshift(start);

  return queueWithFirstTrack;
}
