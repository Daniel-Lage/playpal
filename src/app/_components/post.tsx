import Image from "next/image";
import type { PostObject } from "~/server/types";

export function Post({ post }: { post: PostObject }) {
  return (
    <div className="flex flex-col gap-2 bg-secondary p-2 md:rounded-xl">
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
          <Image height={24} width={24} src="/trash.png" alt="trash icon" />
        </button>
      </div>
      <div>{post.content}</div>
    </div>
  );
}
