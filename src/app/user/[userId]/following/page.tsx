import { getUsersFollowing } from "~/server/get-users-following";
import { UserView } from "~/components/user-view";

export default async function FollowingPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const following = await getUsersFollowing(userId);

  return (
    <>
      <div className="flex">
        {following.map(
          (follow) =>
            follow.followee && (
              <UserView key={follow.followeeId} user={follow.followee} />
            ),
        )}
      </div>
    </>
  );
}
