"use client";

import { getDevices, getMySpotifyUser, getPlaylist } from "~/api/calls";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Logo } from "~/app/_components/logo";
import { getTokens } from "~/api/calls";

import {
  TracksSortingColumnOptions,
  TracksSortingColumn,
  type PlaylistTrack,
} from "~/models/track.model";

import type { SimplifiedArtist } from "~/models/artist.model";
import type { Playlist } from "~/models/playlist.model";
import type { Device } from "~/models/device.model";
import { SpotifyLink } from "~/app/_components/spotify-link";

export default function PlaylistView({
  userId,
  profileId,
  playlistId,
}: {
  userId: string | null;
  profileId: string;
  playlistId: string;
}) {
  const [loading, setLoading] = useState(true);

  const [playlist, setPlaylist] = useState<Playlist | undefined>();
  const [deviceId, setDeviceId] = useState<string | undefined>();
  const [devices, setDevices] = useState<Device[]>([]);
  const [playing, setPlaying] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [premium, setPremium] = useState(false);
  const [sortingColumn, setSortingColumn] = useState<
    TracksSortingColumn | undefined
  >();
  const [reversed, setReversed] = useState<boolean | undefined>();

  useEffect(() => {
    if (sortingColumn !== undefined) {
      localStorage.setItem(`${userId}:tracks_sorting_column`, sortingColumn);
    }
  }, [sortingColumn, userId]);

  useEffect(() => {
    if (reversed !== undefined) {
      localStorage.setItem(`${userId}:tracks_reversed`, reversed.toString());
    }
  }, [reversed, userId]);

  const [filter, setFilter] = useState("");

  const treatedTracks = useMemo(() => {
    if (!playlist) return [];

    const temp = [...playlist.tracks.items]
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

    if (reversed) {
      return temp.reverse();
    }

    return temp;
  }, [playlist, filter, sortingColumn, reversed]);

  const shuffledTracks = useMemo(() => {
    if (!playlist) return [];

    return takeRandomly(
      playlist.tracks.items.filter((track) => !track.is_local),
      99,
    );
  }, [playlist]);

  useEffect(() => {
    setSortingColumn(
      (localStorage.getItem(`${userId}:tracks_sorting_column`) ??
        "Added at") as TracksSortingColumn,
    );
    setReversed(localStorage.getItem(`${userId}:tracks_reversed`) === "true");

    getPlaylist(userId, playlistId)
      .then((playlist) => {
        setLoading(false);
        setPlaylist(playlist);
      })
      .catch(console.error);

    if (userId) {
      getDevices(userId)
        .then((devices) => {
          setDevices(devices);
          if (devices[0]?.id) setDeviceId(devices[0]?.id);
        })
        .catch(console.error);

      getMySpotifyUser(userId)
        .then((spotifyUser) => setPremium(spotifyUser.product === "premium"))
        .catch(console.error);
    }
  }, [playlistId, userId]);

  if (loading) return;

  if (!playlist)
    return <div className="self-center text-xl text-red-500">Error</div>;

  return (
    <>
      {modalIsOpen && (
        <div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center backdrop-brightness-75">
          <div className="flex flex-col items-center gap-1 rounded-md bg-main p-2">
            <div className="rounded-sm bg-main3 p-1">{`https://playpal-sepia.vercel.app/profile/${profileId}/playlist/${playlistId}`}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `https://playpal-sepia.vercel.app/profile/${profileId}/playlist/${playlistId}`,
                );
                setModalIsOpen(false);
              }}
              className="font-bold"
            >
              Copy
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col overflow-hidden md:rounded-2xl">
        <div className="flex flex-col items-center gap-2 bg-main p-2 md:flex-row md:items-start">
          <div className="flex items-start gap-2">
            <Image
              width={200}
              height={200}
              className="rounded-xl"
              src={playlist.images[0]?.url ?? ""}
              alt={playlist.name}
            />

            <Logo />
          </div>

          <div className="flex w-full px-2 md:mt-12">
            <div className="flex grow flex-col items-start truncate">
              <div className="flex items-start justify-between text-wrap text-2xl font-bold">
                {playlist.name}
              </div>
              <div className="text-wrap text-sm font-light">
                {playlist.description}
              </div>
              <div className="text-wrap text-sm font-bold">
                {playlist.owner.display_name} - {playlist.tracks.total} songs
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <SpotifyLink
                size={32}
                external_url={playlist.external_urls.spotify}
              />
              <button
                onClick={() => {
                  setModalIsOpen(true);
                }}
              >
                <Image
                  height={32}
                  width={32}
                  src="/share.png"
                  alt="share icon"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 bg-main2 p-2 md:grid md:grid-cols-3">
          {userId && (
            <div className="flex gap-2">
              {devices.length > 0 && deviceId ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-main3 pl-1 pr-3 text-center">
                  <div className="font-bold md:p-1">Spotify device</div>
                  <select
                    onChange={(e) => {
                      setDeviceId(e.target.value);
                    }}
                  >
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-2 text-sm font-bold">
                  No active spotify device
                </div>
              )}
              <button
                onClick={() => {
                  getDevices(userId)
                    .then((devices) => {
                      setDevices(devices);
                      if (devices[0]?.id) setDeviceId(devices[0]?.id);
                    })
                    .catch(console.error);
                }}
              >
                <Image
                  height={32}
                  width={32}
                  src="/reload.png"
                  alt="reload icon"
                />
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-main3 pl-1 pr-3 text-center">
              <div className="font-bold md:p-1">Sort by</div>
              <select
                onChange={(e) => {
                  setSortingColumn(e.target.value as TracksSortingColumn);
                }}
                defaultValue={sortingColumn ?? TracksSortingColumn.AddedAt}
              >
                {TracksSortingColumnOptions.map((sortingColumn) => (
                  <option key={sortingColumn}>{sortingColumn}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setReversed((prev) => !prev);
              }}
            >
              <Image
                height={32}
                width={32}
                src="/direction.png"
                alt="direction icon"
                className={reversed ? "rotate-180" : ""}
              />
            </button>
          </div>

          <div className="flex w-full gap-2">
            <input
              placeholder="Search something!"
              className="w-32 grow bg-transparent placeholder-zinc-600 outline-none md:w-48"
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {userId && deviceId && !playing && premium && (
              <button
                className="font-extrabold text-red-500"
                onClick={async () => {
                  setPlaying(true);
                  play(userId, shuffledTracks, deviceId)
                    .then(() => setPlaying(false))
                    .catch(console.error);
                }}
              >
                <Image height={32} width={32} src="/play.png" alt="play icon" />
              </button>
            )}
          </div>
        </div>
      </div>

      {treatedTracks.map((track) => (
        <button
          key={track.track.uri}
          className="flex items-center gap-1 bg-secondary p-1 font-bold md:rounded-lg"
          disabled={!deviceId || playing || !premium || track.is_local}
          onClick={() => {
            if (!userId || !deviceId) return;

            setPlaying(true);

            const shuffledTracksWithFirstTrack = [...shuffledTracks];

            const trackIndex = shuffledTracksWithFirstTrack.findIndex(
              (other) => other.track.uri === track.track.uri,
            );

            void shuffledTracksWithFirstTrack.splice(trackIndex, 1)[0];

            shuffledTracksWithFirstTrack.unshift(track);

            play(userId, shuffledTracksWithFirstTrack, deviceId)
              .then(() => setPlaying(false))
              .catch(console.error);
          }}
        >
          {track.track.album.images[0]?.url ? (
            <Image
              width={40}
              height={40}
              className="rounded-md"
              src={track.track.album.images[0]?.url ?? ""}
              alt={track.track.album.name}
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-black" />
          )}
          <div className="grow overflow-hidden">
            <div className="flex grow overflow-hidden">
              <div className="w-full truncate text-left text-sm md:w-1/2">
                {track.track.name}
              </div>
              <div className="w-0 truncate text-left text-sm md:w-1/2">
                {track.track.album.name}
              </div>
            </div>
            <div className="truncate text-left text-xs">
              {track.track.artists.map((artist) => artist.name).join(", ")}
            </div>
          </div>
          {!!track.track.external_urls?.spotify && (
            <SpotifyLink
              size={32}
              external_url={track.track.external_urls.spotify}
            />
          )}
        </button>
      ))}
    </>
  );
}

function takeRandomly<T>(array: Array<T>, limit?: number): Array<T> {
  const size = !limit || limit > array.length ? array.length : limit;

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
  userId: string,
  tracks: PlaylistTrack[],
  deviceId: string,
) {
  const tokens = await getTokens(userId);

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
      ).catch(() => {
        console.error(track.track.disc_number, "EXCEEDED", track.track.name);
      });
    }
  }
}
