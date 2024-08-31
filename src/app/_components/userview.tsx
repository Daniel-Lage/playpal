import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { SignInButton } from "./signinbutton";

export function UserView({ session }: { session?: Session | null }) {
  if (!session?.user?.image || !session?.user?.name) return <SignInButton />;

  return (
    <div className="flex items-center gap-4 bg-main1 p-2 md:rounded-2xl">
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
        <Image height={32} width={32} src="/exit.png" alt="exit icon" />
      </Link>
    </div>
  );
}
