import { getUserFollowers } from "~/server/get-user-followers";
import { User } from "~/app/_components/user";

export default async function OthersProfileFollowersPage({
  params: { profileId },
}: {
  params: { profileId: string };
}) {
  const user = await getUserFollowers(profileId);

  if (!user)
    // no profile
    return <div className="self-center text-xl text-red-500">Error</div>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-start gap-2 bg-main-1 p-2 md:flex-row md:items-center md:rounded-b-xl">
        <div className="font-bold">{user.followers.length} Followers</div>
      </div>
      {user.followers.map(
        (follow) =>
          follow.follower && (
            <User key={follow.followerId} user={follow.follower} />
          ),
      )}
    </div>
  );
}
