import type { User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import type { UserObject } from "~/models/user.model";

export function UserView({ user }: { user: User | UserObject }) {
  return (
    <Link
      key={user.id}
      className="flex items-center bg-secondary-1 p-2 hover:underline md:rounded-xl"
      href={`/user/${user.id}`}
    >
      <Image
        width={32}
        height={32}
        className="aspect-square rounded-full"
        src={user?.image ?? ""}
        alt={user?.name ?? ""}
      />
      <div className="px-2 font-bold">{user?.name}</div>
    </Link>
  );
}
