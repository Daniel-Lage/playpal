import Image from "next/image";
import Link from "next/link";
import { FollowButton } from "./follow-button";
import { SpotifyLink } from "./spotify-link";
import { Logo } from "./logo";
import type { UserObject } from "~/models/user.model";

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
          <div className="grow px-2 font-bold">{user.name}</div>
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
        <Logo />
      </div>
      <div className="flex flex-col bg-main2">
        <div className="flex font-bold">
          <Link
            href={`/profile/${user.providerAccountId}/followers`}
            className={
              "flex w-1/2 justify-center bg-main p-1 text-xs md:text-base"
            }
          >
            Followers
          </Link>

          <Link
            href={`/profile/${user.providerAccountId}/following`}
            className={
              "flex w-1/2 justify-center bg-main2 p-1 text-xs md:text-base"
            }
          >
            Following
          </Link>
        </div>
      </div>
    </div>
  );
}
