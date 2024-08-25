import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { getServerSession, type Session } from "next-auth";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "PlayPal",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

function BottomNav({ session }: { session: Session | null }) {
  return (
    <div className="fixed bottom-0 flex h-16 w-full bg-amber-200 font-bold">
      <div className="flex w-1/3 items-center justify-center">
        {session?.user?.image && session?.user?.name ? (
          <Link href="/profile">
            <Image
              width={40}
              height={40}
              className="rounded-full"
              src={session.user.image}
              alt={session.user.name}
            />
          </Link>
        ) : (
          <Link href="/api/auth/signin">Login</Link>
        )}
      </div>
      <div className="flex w-1/3 items-center justify-center">
        <Link href="/">Home</Link>
      </div>
      <div className="flex w-1/3 items-center justify-center">Preferences</div>
    </div>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex flex-col items-center">
        <main className="flex min-h-screen w-full flex-col gap-4 p-4 pb-20 md:w-3/5">
          {children}
        </main>
        <BottomNav session={session} />
      </body>
    </html>
  );
}
