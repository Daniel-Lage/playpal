import { getServerSession } from "next-auth";

import { PostCreator } from "~/app/_components/post-creator";
import { getPosts } from "~/server/get-posts";
import { authOptions } from "~/lib/auth";
import type { IMetadata, Substring } from "~/models/post.model";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";
import { PostsView } from "./posts-view";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const posts = await getPosts();

  return (
    <>
      {session?.user?.image && session?.user?.name && (
        <PostCreator
          send={async (
            input: string,
            urls: Substring[] | undefined,
            metadata: IMetadata | undefined,
          ) => {
            "use server";
            await postPost(input, session.user.id, urls, metadata);

            revalidatePath("/");
          }}
          sessionUser={session.user}
        />
      )}
      <PostsView
        posts={posts}
        sessionUserId={session?.user.id}
        lastQueried={new Date()}
        refresh={async (lastQueried: Date) => {
          "use server";
          return await getPosts(lastQueried);
        }}
      />
    </>
  );
}
