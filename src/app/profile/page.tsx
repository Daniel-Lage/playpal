import { getServerSession } from "next-auth";

import { authOptions } from "~/lib/auth";
import { SignInButton } from "~/app/_components/signin-button";
import { getUser } from "~/server/get-user";

import { ProfileView } from "./profile-view";

import type { Metadata } from "next";

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

  const user = await getUser(session.user.providerAccountId);

  if (!user)
    return <div className="self-center text-xl text-red-500">Error</div>;

  return <ProfileView sessionUser={session.user} user={user} />;
}
