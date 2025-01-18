import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import Image from "next/image";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? ""),
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

function NavBar() {
  return (
    <div className="fixed bottom-0 flex h-16 w-full gap-6 bg-blue-50 font-bold md:h-full md:w-[19%] md:flex-col md:pl-10 md:pt-4">
      <div className="w-0 md:w-auto">
        <Image
          className="rounded-md"
          width={48}
          height={48}
          src="/favicon.ico"
          alt="playpal logo"
          priority
        />
      </div>
      <div className="flex w-full items-center justify-center md:justify-start">
        <Link href="/profile" className="flex items-end gap-2" role="button">
          <Image height={32} width={32} src="/profile.png" alt="profile icon" />
          <div className="hidden md:block">Profile</div>
        </Link>
      </div>
      <div className="flex w-full items-center justify-center md:justify-start">
        <Link href="/" className="flex items-end gap-2" role="button">
          <Image height={32} width={32} src="/home.png" alt="home icon" />
          <div className="hidden md:block">Home</div>
        </Link>
      </div>
      <div className="flex w-full items-center justify-center md:justify-start">
        <Link href="/search" className="flex items-end gap-2" role="button">
          <Image height={32} width={32} src="/search.png" alt="search icon" />
          <div className="hidden md:block">Search</div>
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
        <main className="flex min-h-screen w-screen flex-col gap-2 pb-[72px] md:gap-4 md:p-4 md:px-[20%] md:pb-20">
          {children}
        </main>
        <NavBar />
      </body>
    </html>
  );
}
