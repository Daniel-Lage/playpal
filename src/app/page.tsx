import { getServerSession } from "next-auth";
import { getPosts } from "~/server/queries";
import { PostCreator } from "./_components/postcreator";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession();
  const posts = await getPosts();

  return (
    <>
      {session && <PostCreator session={session} />}
      {posts.map((post) => (
        <div key={post.id} className="w-full rounded-xl bg-zinc-800 p-4">
          <div className="font-bold">teste</div>
          <div>{post.content}</div>
        </div>
      ))}
    </>
  );
}
