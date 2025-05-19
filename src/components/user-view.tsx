import type { User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import type { UserObject } from "~/models/user.model";

export function UserView({ user }: { user: User | UserObject }) {
  return (
    <Link
      key={user.id}
      className="flex grow-0 flex-col items-center rounded-md bg-secondary p-2 hover:underline"
      href={`/user/${user.id}`}
    >
      <Image
        width={80}
        height={80}
        className="aspect-square rounded-full"
        src={user?.image ?? ""}
        alt={user?.name ?? ""}
      />
      <div className="px-2 font-bold">{user?.name}</div>
    </Link>
  );
}
