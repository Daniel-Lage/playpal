import Image from "next/image";
import Link from "next/link";
import { deleteUser, followUser, unfollowUser } from "~/server/queries";

export function FollowButton({
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
