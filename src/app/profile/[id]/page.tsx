import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { ProfileView } from "../profile-view";
import { getUserFromSpotifyUserId, getUsersPosts } from "~/server/queries";

export default async function Profile({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return;
  }

  if (session?.user?.providerAccountId === id) {
    const posts = await getUsersPosts(session.user.id);

    return <ProfileView session={session} user={session.user} posts={posts} />;
  }

  const user = await getUserFromSpotifyUserId(id);

  if (!user) return <div>no user?</div>;

  const posts = await getUsersPosts(user.id);

  return <ProfileView session={session} user={user} posts={posts} />;
}
