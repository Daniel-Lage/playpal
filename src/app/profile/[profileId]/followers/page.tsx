import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { getUserFollowers } from "~/server/get-user-followers";
import { User } from "~/app/_components/user";
import SimpleUserView from "~/app/_components/simple-user-view";

export default async function OthersProfileFollowersPage({
  params: { profileId },
}: {
  params: { profileId: string };
}) {
  const session = await getServerSession(authOptions);

  const user = await getUserFollowers(profileId);

  if (!user?.image || !user?.name)
    return <div className="self-center text-xl text-red-500">Error</div>;

  return (
    <div>
      <SimpleUserView sessionUserId={session?.user.id} user={user} />

      <div className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 bg-main p-2 md:flex-row md:items-center md:rounded-b-xl">
          <div className="font-bold">{user.followers.length} Followers</div>
        </div>
        {user.followers.map(
          (follow) =>
            follow.follower && (
              <User key={follow.followerId} user={follow.follower} />
            ),
        )}
      </div>
    </div>
  );
}
