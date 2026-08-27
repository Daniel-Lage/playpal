import type { UserObject } from "~/models/user.model";
import { UserFeedView } from "~/components/views/user-feed-view";
import { getUsersFollowers } from "~/server/get-users-followers";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import type { Metadata } from "next";
import { getUser } from "~/server/get-user";

export async function generateMetadata({
  params: { userId },
}: {
  params: { userId: string };
}): Promise<Metadata> {
  const user = await getUser(userId);

  if (!user)
    return {
      title: "PlayPal | User | Followers",
      openGraph: {
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/users/${userId}/followers`,
      },
    };

  return {
    title: `Playpal | ${user.name} | Followers`,
    openGraph: {
      images: [user.image ?? "/favicon.ico"],
      type: "profile",
      url: `${process.env.NEXTAUTH_URL}/users/${userId}/followers`,
    },
  };
}

export default async function UsersFollowersPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);

  const followers = await getUsersFollowers(userId);

  return (
    <>
      <div className="flex flex-col gap-1 bg-container pt-4">
        <div className="ml-2 font-bold">Followers</div>
      </div>

      <UserFeedView
        users={followers
          .map((follow) => follow.follower as UserObject)
          .filter((user) => !!user)}
        sessionUserId={session?.user.id}
      />
    </>
  );
}
