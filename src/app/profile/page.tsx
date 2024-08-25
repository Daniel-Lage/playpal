import { getServerSession } from "next-auth";
import { Playlists } from "./playlists";

import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session?.user?.image || !session?.user?.name)
    return (
      <>
        <div>Error 302: unauthorized</div>
      </>
    );

  return (
    <>
      <div className="flex w-full items-center gap-4 rounded-xl bg-zinc-700 p-4">
        <div className="flex grow items-center gap-4">
          <div className="rounded-full bg-black p-1">
            <Image
              width={64}
              height={64}
              className="rounded-full"
              src={session.user.image}
              alt={session.user.name}
            />
          </div>
          <div className="font-bold">{session.user.name}</div>
        </div>
        <Link href="/api/auth/signout">Logout</Link>
      </div>
      <Playlists />
    </>
  );
}
