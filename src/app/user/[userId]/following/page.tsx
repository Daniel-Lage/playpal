import { getUsersFollowing } from "~/server/get-users-following";
import { UserFeedView } from "~/components/user-feed-view";
import type { UserObject } from "~/models/user.model";

export default async function FollowingPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const following = await getUsersFollowing(userId);

  return (
    <>
      <div className="mainview">
        <UserFeedView
          users={following
            .map((follow) => follow.followee as UserObject)
            .filter((user) => !!user)}
        />
      </div>
      <div className="endnavview"></div>
    </>
  );
}
