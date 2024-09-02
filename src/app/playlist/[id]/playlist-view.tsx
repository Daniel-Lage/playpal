"use client";

import type {
  Device,
  Playlist,
  PlaylistTrack,
  SimplifiedArtist,
  tracksSortingColumn,
} from "~/api/types";
import { getDevices, getPlaylist } from "~/api/calls";
import type { Session } from "next-auth";
import { useEffect, useMemo, useState } from "react";
import { getTokens } from "~/api/calls";
import Image from "next/image";
import { Logo } from "../../_components/logo";
import { SignInButton } from "../../_components/signin-button";

const initialSortingColumn: tracksSortingColumn = "Added at";
const initialReversed = false;

export default function PlaylistView({
  session,
  id,
}: {
  session: Session;
  id: string;
}) {
  const [playlist, setPlaylist] = useState<Playlist | undefined>();
  const [deviceId, setDeviceId] = useState<string | undefined>();
  const [devices, setDevices] = useState<Device[]>([]);
  const [playing, setPlaying] = useState(false);

  const [sortingColumn, setSortingColumn] = useState(initialSortingColumn);
  const [reversed, setReversed] = useState(initialReversed);
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

        if (sortingColumn === "Name") {
          keyA = trackA.track.name.toLowerCase();
          keyB = trackB.track.name.toLowerCase();
        }

        if (sortingColumn === "Album") {
          keyA = trackA.track.album.name.toLowerCase();
          keyB = trackB.track.album.name.toLowerCase();
        }

        if (sortingColumn === "Artists") {
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
    getPlaylist(session.user.id, id)
      .then((playlist) => {
        setPlaylist(playlist);
      })
      .catch(console.error);

    getDevices(session.user.id)
      .then((devices) => {
        setDevices(devices);
        if (devices[0]?.id) setDeviceId(devices[0]?.id);
      })
      .catch(console.error);
  }, [id, session]);

  if (!playlist || !session) return <SignInButton />;

  return (
    <>
      <div className="flex flex-col overflow-hidden md:rounded-2xl">
        <div className="flex flex-col items-center gap-2 bg-main1 p-2 md:flex-row md:items-start">
          <Image
            width={240}
            height={240}
            className="rounded-xl"
            src={playlist.images[0]?.url ?? ""}
            alt={playlist.name}
          />
          <div className="flex items-start">
            <div className="flex flex-col items-start">
              <div className="flex items-start justify-between text-2xl font-bold md:text-6xl">
                {playlist.name}
              </div>
              <div className="text-base font-light md:text-lg">
                {playlist.description}
              </div>
              <div className="text-base font-bold md:text-lg">
                {playlist.owner.display_name} - {playlist.tracks.total} songs
              </div>
            </div>
            <Logo />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 bg-main2 p-2 md:flex-row">
          <div className="flex justify-end gap-2">
            <div className="flex w-full flex-col items-center rounded-xl bg-main3 text-center text-sm md:w-auto md:text-base">
              {devices.length > 0 && deviceId ? (
                <>
                  <div className="font-bold md:p-1">Spotify device</div>
                  <select
                    className="w-full cursor-pointer rounded-b-lg bg-main1 text-center md:p-1"
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
                </>
              ) : (
                <div className="p-2 font-bold">No active spotify device</div>
              )}
            </div>
            <button
              onClick={() => {
                getDevices(session.user.id)
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

          <div className="flex justify-end gap-2">
            <div className="flex w-full flex-col items-center rounded-xl bg-main3 text-center text-sm md:w-auto md:text-base">
              <div className="font-bold md:p-1">Sorting column</div>
              <select
                className="w-full cursor-pointer rounded-b-lg bg-main1 text-center md:p-1"
                onChange={(e) => {
                  setSortingColumn(e.target.value as tracksSortingColumn);
                }}
                value={initialSortingColumn}
              >
                {["Name", "Artists", "Album", "Added at"].map(
                  (sortingColumn) => (
                    <option key={sortingColumn}>{sortingColumn}</option>
                  ),
                )}
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

          <div className="flex gap-2 text-sm md:text-base">
            <input
              placeholder="Search something!"
              className="w-32 grow bg-transparent placeholder-zinc-600 outline-none md:w-48"
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {deviceId && !playing && (
              <button
                className="font-extrabold text-red-500"
                onClick={async () => {
                  setPlaying(true);
                  play(session.user.id, shuffledTracks, deviceId)
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
          disabled={!deviceId || playing || track.is_local}
          onClick={() => {
            if (!deviceId) return;

            setPlaying(true);

            const shuffledTracksWithFirstTrack = [...shuffledTracks];

            const trackIndex = shuffledTracksWithFirstTrack.findIndex(
              (other) => other.track.uri === track.track.uri,
            );

            void shuffledTracksWithFirstTrack.splice(trackIndex, 1)[0];

            shuffledTracksWithFirstTrack.unshift(track);

            play(session.user.id, shuffledTracksWithFirstTrack, deviceId)
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
              <div className="truncate text-left text-sm md:w-1/2">
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
