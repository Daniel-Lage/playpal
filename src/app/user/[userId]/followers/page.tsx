import { getUsersFollowers } from "~/server/get-users-followers";
import type { UserObject } from "~/models/user.model";
import { UserFeedView } from "~/components/user-feed-view";
import { PageView } from "~/components/page-view";

export default async function FollowersPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const followers = await getUsersFollowers(userId);

  return (
    <PageView>
      <UserFeedView
        users={followers
          .map((follow) => follow.follower as UserObject)
          .filter((user) => !!user)}
      />
    </PageView>
  );
}
