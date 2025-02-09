import { getUsersFollowing } from "~/server/get-users-following";
import { UserView } from "~/app/_components/user-view";

export default async function OthersProfileFollowingPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const following = await getUsersFollowing(userId);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-start gap-2 bg-main-1 p-2 md:flex-row md:items-center md:rounded-b-xl">
        <div className="font-bold">{following.length} Following</div>
      </div>
      {following.map(
        (follow) =>
          follow.followee && (
            <UserView key={follow.followeeId} user={follow.followee} />
          ),
      )}
    </div>
  );
}
