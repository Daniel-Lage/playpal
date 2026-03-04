import { getUsersFollowers } from "~/server/get-users-followers";
import type { UserObject } from "~/models/user.model";
import { UserFeedView } from "~/components/user-feed-view";

export default async function FollowersPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const followers = await getUsersFollowers(userId);

  return (
    <>
      <div className="mainview">
        <UserFeedView
          users={followers
            .map((follow) => follow.follower as UserObject)
            .filter((user) => !!user)}
        />
      </div>
      <div className="endnavview"></div>
    </>
  );
}
