import Image from "next/image";
import Link from "next/link";
import { SpotifyLink } from "./spotify-link";
import type { UserObject } from "~/models/user.model";
import { unfollowUser } from "~/server/unfollow-user";
import { followUser } from "~/server/follow-user";
import { deleteUser } from "~/server/delete-user";

export default function SimpleUserView({
  user,
  sessionUserId,
}: {
  user: UserObject;
  sessionUserId: string | undefined;
}) {
  if (!user?.name || !user.image) return;

  return (
    <div className="flex flex-col gap-2 overflow-hidden bg-main md:rounded-t-xl">
      <div className="flex items-center gap-2 p-2">
        <Link
          className="flex grow items-center"
          href={`/profile/${user.providerAccountId}`}
        >
          <Image
            width={40}
            height={40}
            className="rounded-full"
            src={user.image}
            alt={user.name}
          />
          <div className="grow px-2 font-bold hover:underline">{user.name}</div>
        </Link>

        <FollowButton
          sessionUserId={sessionUserId}
          userId={user.id}
          isFollowing={user.followers.some(
            (follow) => follow.followerId === sessionUserId,
          )}
        />

        <SpotifyLink
          size={32}
          external_url={`https://open.spotify.com/user/${user.providerAccountId}`}
        />
      </div>
      <div className="flex gap-2 pl-4 text-xs font-bold text-gray-700 md:text-base">
        <Link
          href={`/profile/${user.providerAccountId}/followers`}
          className="hover:underline"
        >
          {user.followers.length} followers
        </Link>

        <Link
          href={`/profile/${user.providerAccountId}/following`}
          className="hover:underline"
        >
          {user.following.length} following
        </Link>
      </div>
    </div>
  );
}

function FollowButton({
  sessionUserId,
  userId,
  isFollowing,
}: {
  sessionUserId: string | undefined;
  userId: string;
  isFollowing: boolean;
}) {
  if (sessionUserId === userId)
    return (
      <>
        <Link href="/" onClick={() => deleteUser(sessionUserId)}>
          <Image height={32} width={32} src="/trash.png" alt="trash icon" />
        </Link>
        <Link href="/api/auth/signout">
          <Image height={32} width={32} src="/exit.png" alt="exit icon" />
        </Link>
      </>
    );

  if (isFollowing && sessionUserId)
    return (
      <button
        onClick={() => {
          void unfollowUser(sessionUserId, userId);
        }}
        className="text-sm font-bold"
      >
        Unfollow
      </button>
    );
  return (
    <button
      onClick={() => {
        if (sessionUserId) void followUser(sessionUserId, userId);
        else console.log("open a modal that asks you to log in");
      }}
      className="text-sm font-bold"
    >
      Follow
    </button>
  );
}
