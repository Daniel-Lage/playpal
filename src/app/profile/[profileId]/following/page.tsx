import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { getUserFollowing } from "~/server/get-user-following";
import Link from "next/link";
import { User } from "~/app/_components/user";
import SimpleUserView from "~/app/_components/simple-user-view";

export default async function OthersProfileFollowingPage({
  params: { profileId },
}: {
  params: { profileId: string };
}) {
  const session = await getServerSession(authOptions);

  const user = await getUserFollowing(profileId);

  if (!user?.image || !user?.name)
    return <div className="self-center text-xl text-red-500">Error</div>;

  return (
    <div>
      <div className="flex flex-col gap-2 overflow-hidden bg-main md:rounded-t-xl">
        <SimpleUserView user={user} sessionUserId={session?.user.id} />

        <div className="flex flex-col bg-main2">
          <div className="flex font-bold">
            <Link
              href={`/profile/${user.providerAccountId}/followers`}
              className={
                "flex w-1/2 justify-center bg-main2 p-1 text-xs md:text-base"
              }
            >
              Followers
            </Link>

            <Link
              href={`/profile/${user.providerAccountId}/following`}
              className={
                "flex w-1/2 justify-center bg-main p-1 text-xs md:text-base"
              }
            >
              Following
            </Link>
          </div>
        </div>
      </div>

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
    </div>
  );
}
