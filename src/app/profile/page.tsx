import { db } from "~/server/db";

import { getServerSession } from "next-auth";
import { Playlists } from "./playlists";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session || !session.user)
    return (
      <>
        <div>meu amigo saia daqui logo</div>
      </>
    );
  return (
    <>
      <div className="flex w-full gap-4 rounded-xl bg-zinc-700 p-4">
        meu profile :)
      </div>
      <Playlists />
    </>
  );
}
