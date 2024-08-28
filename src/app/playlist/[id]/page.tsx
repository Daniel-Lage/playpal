import Image from "next/image";
import { type Playlist } from "~/lib/types";
import { Track } from "../../_components/track";
import { getPlaylist } from "~/server/queries";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { UserView } from "~/app/_components/userview";

export default async function Playlist({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user)
    return (
      <>
        <UserView session={session} />
      </>
    );

  const playlist = await getPlaylist(session.user.id, id);

  return (
    <>
      <div className="flex w-full gap-4 rounded-2xl bg-lime-200 p-4">
        <Image
          width={300}
          height={300}
          className="aspect-square rounded-xl"
          src={playlist.images[0]?.url ?? ""}
          alt={playlist.name}
        />
        <div className="px-2 pt-2">
          <div className="text-6xl font-bold">{playlist.name}</div>
          {playlist.owner.display_name}
        </div>
      </div>
      {playlist.tracks.items.map((track) => (
        <Track key={track.track.id} track={track} />
      ))}
    </>
  );
}
