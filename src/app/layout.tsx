import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { NavBar } from "./nav-bar";

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex flex-col overflow-x-hidden">
        <main className="flex min-h-screen w-screen flex-col gap-2 pb-[72px] md:gap-4 md:p-4 md:px-[20%] md:pb-20">
          {children}
        </main>
        <NavBar
          profileURL={
            session ? `/user/${session?.user.id}` : "/api/auth/signin"
          }
        />
      </body>
    </html>
  );
}
