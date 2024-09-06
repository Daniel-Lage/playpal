import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { SignInButton } from "~/app/_components/signin-button";
import { ProfileView } from "./profile-view";
import { getUsersPosts } from "~/server/queries";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) return <SignInButton />;

  const posts = await getUsersPosts(session.user.id);

  return <ProfileView session={session} user={session.user} posts={posts} />;
}
