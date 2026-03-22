import { getUsersFollowing } from "~/server/get-users-following";
import { UserFeedView } from "~/components/user-feed-view";
import type { UserObject } from "~/models/user.model";
import { PageView } from "~/components/page-view";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";

export default async function FollowingPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);
  const following = await getUsersFollowing(userId);

  return (
    <PageView sessionUser={session?.user}>
      <UserFeedView
        users={following
          .map((follow) => follow.followee as UserObject)
          .filter((user) => !!user)}
      />
    </PageView>
  );
}
