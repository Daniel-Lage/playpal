import { getServerSession } from "next-auth";
import { getPosts } from "~/server/queries";
import { PostCreator } from "./_components/postcreator";
import { authOptions } from "~/lib/auth";
import { Post } from "./_components/post";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const posts = await getPosts();

  return (
    <>
      <PostCreator session={session} />
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </>
  );
}
