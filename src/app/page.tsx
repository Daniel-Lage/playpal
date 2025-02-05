import { getServerSession } from "next-auth";

import { SignInButton } from "~/app/_components/signin-button";
import { PostCreator } from "~/app/_components/post-creator";
import { getPosts } from "~/server/get-posts";
import { authOptions } from "~/lib/auth";
import { Post } from "./_components/post";
import type { IMetadata, Substring } from "~/models/post.model";
import { postPost } from "~/server/post-post";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const posts = await getPosts();

  return (
    <>
      {session?.user?.image && session?.user?.name ? (
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
      ) : (
        <SignInButton />
      )}
      {posts.map((post) => (
        <Post key={post.id} post={post} sessionUserId={session?.user.id} />
      ))}
    </>
  );
}
