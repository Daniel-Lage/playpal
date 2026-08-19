import type { UserObject } from "~/models/user.model";
import { UserFeedView } from "~/components/views/user-feed-view";
import { getUsersFollowers } from "~/server/get-users-followers";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

export default async function FollowersPage({
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
