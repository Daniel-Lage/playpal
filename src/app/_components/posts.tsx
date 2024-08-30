import Image from "next/image";
import type { Post } from "~/lib/types";

export function Posts({ posts }: { posts: Post[] }) {
  return (
    <>
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex items-start rounded-xl bg-zinc-600 p-4"
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
