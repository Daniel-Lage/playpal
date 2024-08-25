import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await db.query.posts.findMany();

  return (
    <>
      {posts.map((post) => (
        <div key={post.id} className="w-full rounded-xl bg-zinc-800 p-4">
          <div className="font-bold">{post.authorID}</div>
          <div>{post.content}</div>
        </div>
      ))}
    </>
  );
}
