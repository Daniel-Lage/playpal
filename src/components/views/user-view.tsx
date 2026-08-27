import Link from "next/link";
import type { UserObject } from "~/models/user.model";
import { UserImage } from "../user-image";
import { FollowButton } from "../buttons/follow-button";

export function UserView({
  user,
  sessionUserId,
}: {
  user: UserObject;
  sessionUserId?: string | null;
}) {
  return (
    <div key={user.id} className="flex grow-0 items-center rounded-md p-2">
      <UserImage size={48} image={user.image} name={user.name} />
      <Link
        href={`/users/${user.id}`}
        className="flex-1 px-2 font-bold hover:underline overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {user?.name}
      </Link>
      <FollowButton user={user} sessionUserId={sessionUserId} />
    </div>
  );
}
