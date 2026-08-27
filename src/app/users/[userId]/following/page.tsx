import { getUsersFollowing } from "~/server/get-users-following";
import type { UserObject } from "~/models/user.model";
import { UserFeedView } from "~/components/views/user-feed-view";
import { authOptions } from "~/lib/auth";
import { getServerSession } from "next-auth";
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
      title: "PlayPal | User | Following",
      openGraph: {
        type: "profile",
        images: ["/favicon.ico"],
        url: `${process.env.NEXTAUTH_URL}/users/${userId}/following`,
      },
    };

  return {
    title: `Playpal | ${user.name} | Following`,
    openGraph: {
      images: [user.image ?? "/favicon.ico"],
      type: "profile",
      url: `${process.env.NEXTAUTH_URL}/users/${userId}/following`,
    },
  };
}

export default async function UsersFollowingPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);

  const following = await getUsersFollowing(userId);

  return (
    <>
      <div className="flex flex-col gap-1 bg-container pt-4">
        <div className="ml-2 font-bold">Following</div>
      </div>

      <UserFeedView
        users={following
          .map((follow) => follow.followee as UserObject)
          .filter((user) => !!user)}
        sessionUserId={session?.user.id}
      />
    </>
  );
}
