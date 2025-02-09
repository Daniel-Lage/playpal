import { getUsersFollowers } from "~/server/get-users-followers";
import { UserView } from "~/app/_components/user-view";

export default async function OthersProfileFollowersPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const followers = await getUsersFollowers(userId);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-start gap-2 bg-main-1 p-2 md:flex-row md:items-center md:rounded-b-xl">
        <div className="font-bold">{followers.length} Followers</div>
      </div>
      {followers.map(
        (follow) =>
          follow.follower && (
            <UserView key={follow.followerId} user={follow.follower} />
          ),
      )}
    </div>
  );
}
