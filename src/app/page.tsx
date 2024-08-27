import { getServerSession } from "next-auth";
import { getPosts } from "~/server/queries";
import { PostCreator } from "./_components/postcreator";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession();
  const posts = await getPosts();

  return (
    <>
      {session && <PostCreator session={session} />}
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex w-full items-start rounded-xl bg-zinc-600 p-4"
        >
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={post.author?.image ?? ""}
            alt={post.author?.name ?? ""}
          />
          <div className="px-2 pt-2">
            <div className="font-bold">{post.author?.name}</div>
            {post.content}
          </div>
        </div>
      ))}
    </>
  );
}
