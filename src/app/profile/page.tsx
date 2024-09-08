import { getServerSession } from "next-auth";

import { authOptions } from "~/lib/auth";
import { SignInButton } from "~/app/_components/signin-button";
import { getUsersPosts } from "~/server/queries";

import { ProfileView } from "./profile-view";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) return <SignInButton />;

  const posts = await getUsersPosts(session.user.id);

  return <ProfileView session={session} user={session.user} posts={posts} />;
}
