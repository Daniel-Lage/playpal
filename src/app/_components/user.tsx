import type { User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import type { UserObject } from "~/models/user.model";

export function User({ user }: { user: User | UserObject }) {
  return (
    <Link
      key={user.id}
      className="bg-secondary-1 flex items-center p-2 hover:underline md:rounded-xl"
      href={`/profile/${user.providerAccountId}`}
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
