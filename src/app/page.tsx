import { db } from "~/server/db";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
export const dynamic = "force-dynamic";

function PostCreator() {
  return <div>WIP</div>;
}

export default async function HomePage() {
  const posts = await db.query.posts.findMany();

  return (
    <main className="flex min-h-screen grow flex-col gap-y-2 bg-zinc-900 px-2 pt-2 md:mx-[20%]">
      <div className="w-full rounded-xl bg-zinc-700 p-4">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
          <PostCreator />
        </SignedIn>
      </div>
      {[...posts, ...posts].map((post) => (
        <div key={post.id} className="w-full rounded-xl bg-black p-4">
          <div className="font-bold">{post.authorID}</div>
          <div>{post.content}</div>
        </div>
      ))}
    </main>
  );
}
