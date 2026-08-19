import { getUsersFollowing } from "~/server/get-users-following";
import type { UserObject } from "~/models/user.model";
import { UserFeedView } from "~/components/views/user-feed-view";
import { authOptions } from "~/lib/auth";
import { getServerSession } from "next-auth";

export default async function FollowingPage({
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
