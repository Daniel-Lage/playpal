import type { User } from "next-auth";
import Link from "next/link";
import type { UserObject } from "~/models/user.model";
import { UserImage } from "./user-image";

export function UserView({ user }: { user: User | UserObject }) {
  return (
    <Link
      key={user.id}
      className="flex grow-0 flex-col items-center p-2 hover:underline"
      href={`/user/${user.id}`}
    >
      <UserImage size={80} image={user.image} name={user.name} />
      <div className="px-2 font-bold">{user?.name}</div>
    </Link>
  );
}
