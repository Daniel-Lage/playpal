import { type Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";

export function UserView({
  session,
  children,
}: {
  session: Session | null;
  children?: Readonly<React.ReactNode>;
}) {
  if (!session?.user?.image || !session?.user?.name)
    return (
      <Link
        href="/api/auth/signin"
        className="flex justify-center gap-4 rounded-2xl bg-lime-200 p-4 font-bold hover:bg-lime-400"
      >
        Sign In
      </Link>
    );

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-lime-200 p-4">
      <div className="flex grow items-center gap-4">
        <Image
          width={64}
          height={64}
          className="rounded-full"
          src={session.user.image}
          alt={session.user.name}
        />
        <div className="flex grow flex-col font-bold">
          {session.user.name}
          {children}
        </div>
      </div>
      <Link href="/api/auth/signout">Sign out</Link>
    </div>
  );
}
