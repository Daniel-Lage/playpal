import type { User } from "next-auth";
import Link from "next/link";
import type { UserObject } from "~/models/user.model";
import { UserImage } from "./user-image";
import { cn } from "~/lib/utils";

export function UserView({
  user,
  color,
}: {
  user: User | UserObject;
  color?: string;
}) {
  return (
    <Link
      key={user.id}
      className={cn(
        "flex grow-0 items-center rounded-md p-2 hover:underline",
        color ? `bg-${color}` : "bg-secondary",
      )}
      href={`/user/${user.id}`}
    >
      <UserImage size={48} image={user.image} name={user.name} />
      <div className="px-2 font-bold">{user?.name}</div>
    </Link>
  );
}
