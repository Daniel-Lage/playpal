import { getServerSession } from "next-auth";
import { Playlists } from "./playlists";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session?.user)
    return (
      <>
        <div>Error 302: unauthorized</div>
      </>
    );
  return (
    <>
      <div className="flex w-full gap-4 rounded-xl bg-zinc-700 p-4">
        meu profile :)
        <Link href="/api/auth/signout">Sair</Link>
      </div>
      <Playlists />
    </>
  );
}
