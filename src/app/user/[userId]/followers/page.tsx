import { getUsersFollowers } from "~/server/get-users-followers";
import type { UserObject } from "~/models/user.model";
import { UserFeedView } from "~/components/user-feed-view";
import { PageView } from "~/components/page-view";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "~/lib/auth";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export default async function FollowersPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const followers = await getUsersFollowers(userId);

  return (
    <PageView
      sessionUser={session?.user}
      initialCollapsed={
        cookieStore.get(
          storageKeyToCookieName(`${session?.user.id}:side_bar_collapsed`),
        )?.value === "true"
      }
    >
      <UserFeedView
        users={followers
          .map((follow) => follow.follower as UserObject)
          .filter((user) => !!user)}
      />
    </PageView>
  );
}
