import { getServerSession } from "next-auth";

import { getUser, getUsersPosts } from "~/server/queries";
import { authOptions } from "~/lib/auth";

import { ProfileView } from "../profile-view";
import { Metadata } from "next";

export async function generateMetadata({
  params: { profileId },
}: {
  params: { profileId: string };
}): Promise<Metadata> {
  const user = await getUser(profileId);

  if (!user)
    return {
      title: "PlayPal | Profile",
      openGraph: {
        title: "PlayPal | Profile",
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/profile`,
      },
    };

  if (!user.image)
    return {
      title: `Playpal | ${user.name}`,
      openGraph: {
        title: "PlayPal | Profile",
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/profile`,
      },
    };

  return {
    title: `Playpal | ${user.name}`,
    openGraph: {
      images: [user.image],
      title: `${user.name}'s profile`,
      type: "profile",
      url: `${process.env.NEXTAUTH_URL}/profile/${profileId}`,
    },
  };
}

export default async function OthersProfilePage({
  params: { profileId },
}: {
  params: { profileId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    const user = await getUser(profileId);

    if (!user)
      return <div className="self-center text-xl text-red-500">Error</div>;

    const posts = await getUsersPosts(user.id);

    return <ProfileView userId={null} user={user} posts={posts} />;
  }

  if (session?.user?.providerAccountId === profileId) {
    const posts = await getUsersPosts(session.user.id);

    return (
      <ProfileView userId={session.user.id} user={session.user} posts={posts} />
    );
  }

  const user = await getUser(profileId);

  if (!user)
    return <div className="self-center text-xl text-red-500">Error</div>;

  const posts = await getUsersPosts(user.id);

  return <ProfileView userId={session.user.id} user={user} posts={posts} />;
}
