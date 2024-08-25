import { db } from "~/server/db";

import Link from "next/link";

import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import Image from "next/image";

export const dynamic = "force-dynamic";

function AccountView({ session }: { session: Session | null }) {
  if (!session?.user)
    return (
      <>
        <Link href="/api/auth/signin">Entrar</Link>
      </>
    );

  return (
    <>
      {session.user.image && session.user.name && (
        <Link href="/profile">
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={session.user.image}
            alt={session.user.name}
          />
        </Link>
      )}
      <div className="grow">{session.user.name}</div>
      <Link href="/api/auth/signout">Sair</Link>
    </>
  );
}

export default async function HomePage() {
  const session = await getServerSession();
  const posts = await db.query.posts.findMany();

  return (
    <>
      <div className="flex w-full gap-4 rounded-xl bg-zinc-700 p-4">
        <AccountView session={session} />
      </div>
      {posts.map((post) => (
        <div key={post.id} className="w-full rounded-xl bg-zinc-900 p-4">
          <div className="font-bold">{post.authorID}</div>
          <div>{post.content}</div>
        </div>
      ))}
    </>
  );
}
