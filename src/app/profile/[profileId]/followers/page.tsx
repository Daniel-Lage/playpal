import { getServerSession } from "next-auth";
import Image from "next/image";
import { authOptions } from "~/lib/auth";
import { getUserFollowers, getUserFollowing } from "~/server/queries";
import { FollowButton } from "../../profile-view";
import { SpotifyLink } from "~/app/_components/spotify-link";
import { Logo } from "~/app/_components/logo";
import Link from "next/link";

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
    <>
      <div className="flex flex-col gap-2 overflow-hidden bg-main md:rounded-xl">
        <div className="flex items-center gap-2 p-2">
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={user.image}
            alt={user.name}
          />
          <div className="grow px-2 font-bold">{user.name}</div>

          <FollowButton userId={session?.user.id} user={user} />

          <SpotifyLink
            size={32}
            external_url={`https://open.spotify.com/user/${user.providerAccountId}`}
          />
          <Logo />
        </div>

        <div className="flex gap-2 self-center font-bold">
          <Link href={`/profile/${user.providerAccountId}/followers`}>
            {user.followers.length} Followers
          </Link>
          <Link href={`/profile/${user.providerAccountId}/following`}>
            {user.following.length} Following
          </Link>
        </div>
        <div className="bg-main3 text-center font-bold">Is Followed By</div>
      </div>

      {user.followers.map(
        (follow) =>
          follow.follower && (
            <Link
              className="flex items-center bg-secondary p-2 md:rounded-xl"
              href={`/profile/${follow.follower.providerAccountId}`}
            >
              <Image
                width={32}
                height={32}
                className="rounded-full"
                src={follow.follower?.image ?? ""}
                alt={follow.follower?.name ?? ""}
              />
              <div className="px-2 font-bold">{follow.follower?.name}</div>
            </Link>
          ),
      )}
    </>
  );
}
