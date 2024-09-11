import { getServerSession } from "next-auth";

import { authOptions } from "~/lib/auth";
import { SignInButton } from "~/app/_components/signin-button";
import { getUsersPosts } from "~/server/queries";

import { ProfileView } from "./profile-view";

import type { Metadata } from "next";
import { formatPost } from "~/lib/format-post";

export const metadata: Metadata = {
  title: "PlayPal | Profile",
  openGraph: {
    title: "PlayPal | Profile",
    type: "profile",
    images: ["/favicon.ico"],
    url: `${process.env.NEXTAUTH_URL}/profile`,
  },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) return <SignInButton />;

  const posts = await Promise.all(
    (await getUsersPosts(session.user.id)).map(formatPost),
  );

  return (
    <ProfileView userId={session.user.id} user={session.user} posts={posts} />
  );
}
