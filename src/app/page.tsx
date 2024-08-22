import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await db.query.posts.findMany();

  return (
    <main className="flex min-h-screen w-3/5 flex-col justify-center text-white">
      {posts.map((post) => (
        <div key={post.id} className="w-full rounded-xl bg-gray-900 p-4">
          <div className="font-bold">{post.authorID}</div>
          <div>{post.content}</div>
        </div>
      ))}
    </main>
  );
}
