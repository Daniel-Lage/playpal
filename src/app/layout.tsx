import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import Image from "next/image";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PlayPal",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "PlayPal",
    images: ["/favicon.ico"],
    url: process.env.NEXTAUTH_URL,
    type: "website",
    siteName: "Playpal",
  },
};

function BottomNav() {
  return (
    <div className="fixed bottom-0 flex h-16 w-full bg-nav font-bold">
      <div className="flex w-1/2 items-center justify-center">
        <Link href="/profile">
          <Image height={32} width={32} src="/profile.png" alt="profile icon" />
        </Link>
      </div>
      <div className="flex w-1/2 items-center justify-center">
        <Link href="/">
          <Image height={32} width={32} src="/home.png" alt="home icon" />
        </Link>
      </div>
    </div>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex flex-col overflow-x-hidden">
        <main className="flex min-h-screen w-screen flex-col gap-2 pb-16 md:gap-4 md:p-4 md:px-[20%] md:pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
