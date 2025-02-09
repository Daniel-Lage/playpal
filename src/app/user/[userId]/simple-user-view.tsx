import Image from "next/image";
import Link from "next/link";
import { SpotifyLink } from "../../_components/spotify-link";
import type { UserObject } from "~/models/user.model";
import { FollowButton } from "./follow-button";

export function SimpleUserView({
  user,
  sessionUserId,
}: {
  user: UserObject;
  sessionUserId: string | undefined;
}) {
  if (!user?.name || !user.image) return;

  return (
    <div className="flex flex-col gap-2 overflow-hidden bg-main-1 md:rounded-t-xl">
      <div className="flex items-center gap-2 p-2">
        <Link className="flex grow items-center" href={`/user/${user.id}`}>
          <Image
            width={40}
            height={40}
            className="aspect-square rounded-full"
            src={user.image}
            alt={user.name}
          />
          <div className="grow px-2 font-bold hover:underline">{user.name}</div>
        </Link>

        <FollowButton sessionUserId={sessionUserId} user={user} />

        <SpotifyLink
          size={32}
          external_url={`https://open.spotify.com/user/${user.id}`}
        />
      </div>
      <div className="flex gap-2 pl-4 text-xs font-bold text-gray-700 md:text-base">
        <Link href={`/user/${user.id}/followers`} className="hover:underline">
          {user.followers.length} followers
        </Link>

        <Link href={`/user/${user.id}/following`} className="hover:underline">
          {user.following.length} following
        </Link>
      </div>
    </div>
  );
}
