import { getServerSession } from "next-auth";
import { UserView } from "../_components/userview";
import { getPlaylists } from "~/server/queries";
import { authOptions } from "~/lib/auth";
import Link from "next/link";
import Image from "next/image";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session?.user)
    return (
      <>
        <UserView session={session} />
      </>
    );

  const playlists = await getPlaylists(session.user.id);

  return (
    <>
      <UserView session={session} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {playlists.map((playlist) => (
          <Link
            href={`/playlist/${playlist.id}`} // WIP
            key={playlist.id}
            className="flex flex-col items-center overflow-hidden rounded-2xl bg-zinc-500 hover:bg-zinc-600"
          >
            <Image
              width={500}
              height={500}
              className="aspect-square"
              src={playlist.images[0]?.url ?? ""}
              alt={playlist.name}
            />

            <div className="h-16 px-2 pt-2 text-center">{playlist.name}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
