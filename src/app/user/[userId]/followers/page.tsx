import { getUsersFollowers } from "~/server/get-users-followers";
import { UserView } from "~/app/_components/user-view";

export default async function FollowersPage({
  params: { userId },
}: {
  params: { userId: string };
}) {
  const followers = await getUsersFollowers(userId);

  return (
    <>
      <div className="flex">
        {followers.map(
          (follow) =>
            follow.follower && (
              <UserView key={follow.followerId} user={follow.follower} />
            ),
        )}
      </div>
    </>
  );
}
