import { getServerSession } from "next-auth";
import { getPosts } from "~/server/queries";
import { PostCreator } from "./_components/postcreator";
import { authOptions } from "~/lib/auth";
import { Posts } from "./_components/posts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const posts = await getPosts();

  return (
    <>
      <PostCreator session={session} />
      <Posts posts={posts} />
    </>
  );
}
