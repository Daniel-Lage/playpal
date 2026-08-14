import type { UserObject } from "~/models/user.model";
import { UserFeedView } from "~/components/views/user-feed-view";
import { getUsersFollowers } from "~/server/get-users-followers";

export default async function FollowingPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const followers = await getUsersFollowers(userId);

  return (
    <>
      <div className="flex flex-col gap-1 bg-container">
        <div className="ml-2 font-bold">Following</div>
      </div>

      <UserFeedView
        users={followers
          .map((follow) => follow.follower as UserObject)
          .filter((user) => !!user)}
      />
    </>
  );
}
