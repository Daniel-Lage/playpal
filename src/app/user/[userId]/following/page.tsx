import { getUsersFollowing } from "~/server/get-users-following";
import { UserFeedView } from "~/components/user-feed-view";
import type { UserObject } from "~/models/user.model";
import { PageView } from "~/components/page-view";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "~/lib/auth";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

export default async function FollowingPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const following = await getUsersFollowing(userId);

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
        users={following
          .map((follow) => follow.followee as UserObject)
          .filter((user) => !!user)}
      />
    </PageView>
  );
}
