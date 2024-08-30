import Image from "next/image";
import type { Post } from "~/lib/types";

export function Post({ post }: { post: Post }) {
  return (
    <div className="bg-secondary flex flex-col gap-2 p-2 md:rounded-xl">
      <div className="flex items-center">
        <Image
          width={32}
          height={32}
          className="rounded-full"
          src={post.author?.image ?? ""}
          alt={post.author?.name ?? ""}
        />
        <div className="grow px-2 font-bold">{post.author?.name}</div>
        <button>
          <Image height={32} width={32} src="/trash.svg" alt="trash icon" />
        </button>
      </div>
      <div>{post.content}</div>
    </div>
  );
}
