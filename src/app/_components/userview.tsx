import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

export function UserView({ session }: { session?: Session | null }) {
  if (!session?.user?.image || !session?.user?.name)
    return (
      <Link
        href="/api/auth/signin"
        className="bg-main1 flex justify-center gap-4 p-4 font-bold md:rounded-2xl"
      >
        <Image height={32} width={32} src="/enter.svg" alt="enter icon" />
      </Link>
    );

  return (
    <div className="bg-main1 flex items-center gap-4 p-2 md:rounded-2xl">
      <div className="flex grow items-center gap-4">
        <Image
          width={64}
          height={64}
          className="rounded-full"
          src={session.user.image}
          alt={session.user.name}
        />
        <div className="flex grow flex-col font-bold">{session.user.name}</div>
      </div>
      <Link href="/api/auth/signout">
        <Image height={32} width={32} src="/exit.svg" alt="exit icon" />
      </Link>
    </div>
  );
}
