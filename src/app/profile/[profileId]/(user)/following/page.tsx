import { getUserFollowing } from "~/server/get-user-following";
import { User } from "~/app/_components/user";

export default async function OthersProfileFollowingPage({
  params: { profileId },
}: {
  params: { profileId: string };
}) {
  const user = await getUserFollowing(profileId);

  if (!user)
    // no profile
    return <div className="self-center text-xl text-red-500">Error</div>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-xl">
        <div className="font-bold">{user.following.length} Following</div>
      </div>
      {user.following.map(
        (follow) =>
          follow.followee && (
            <User key={follow.followeeId} user={follow.followee} />
          ),
      )}
    </div>
  );
}
