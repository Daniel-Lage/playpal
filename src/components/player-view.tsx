import Image from "next/image";
import { cn } from "~/lib/utils";
import { PlayButton } from "./buttons/play-button";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { formatTime } from "~/helpers/format-time";

export function PlayerView({
  playerState,
  togglePlay,
}: {
  playerState?: Spotify.PlaybackState | undefined;
  togglePlay: () => void;
}) {
  if (playerState?.track_window.current_track == null) return null;
  const track = playerState?.track_window.current_track;

  return (
    <div className="margin-auto fixed bottom-20 flex w-full px-6 md:bottom-6 md:w-[--main-view-w] md:px-6">
      <div
        className={cn(
          "relative flex grow items-center justify-between gap-4 self-center rounded-md bg-primary pb-2 md:w-fit md:pb-0",
        )}
      >
        <div className="flex items-center">
          {track.album.images[0]?.url ? (
            <Image
              width={48}
              height={48}
              className="m-2 aspect-square h-auto w-12 flex-shrink-0 flex-grow-0 rounded-md"
              src={track.album.images[0]?.url ?? ""}
              alt={track.album.name}
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-black" />
          )}
          <div className="overflow-hidden md:w-24">
            <div className="flex grow overflow-hidden">
              <div className="w-full truncate text-left text-sm">
                {track.name}
              </div>
            </div>
            <div className="truncate text-left text-xs">
              {track.artists.map((artist) => artist.name).join(", ")}
            </div>
          </div>
        </div>

        <ProgressBar
          initialValue={playerState.position}
          limit={track.duration_ms}
          paused={playerState.paused}
        />

        <div className="m-2">
          <PlayButton onClick={togglePlay}>
            {playerState.paused ? (
              <Play fill="black" stroke="black" />
            ) : (
              <Pause fill="black" stroke="black" />
            )}
          </PlayButton>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  initialValue,
  limit,
  paused,
}: {
  initialValue: number;
  limit: number;
  paused: boolean;
}) {
  const [progress, setProgress] = useState(initialValue);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!paused) {
        setProgress((prev) => Math.min(prev + 1000, limit));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [limit, paused, initialValue]);

  useEffect(() => {
    setProgress(initialValue);
  }, [initialValue]);

  return (
    <>
      <div className="hidden md:block">{formatTime(progress)}</div>
      <div className="absolute bottom-0 flex h-2 w-full grow overflow-hidden rounded-full bg-black md:relative md:bottom-auto md:w-auto">
        <div
          className={`player-bar grow-0 bg-white`}
          style={{
            width: `${(progress / limit) * 100}%`,
          }}
        ></div>
      </div>
      <div className="hidden md:block">{formatTime(limit)}</div>
    </>
  );
}
