import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { StartNav, EndNav } from "./nav-bars";

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
    <html lang="en" className={GeistSans.variable}>
      <body className="overflow-x-hidden">
        <StartNav
          profileURL={session ? `/user/${session?.user.id}` : undefined}
        />
        <main className="z-0 my-12 max-w-screen-sm overflow-hidden md:my-0">
          {children}
        </main>
        <EndNav sessionUser={session?.user} />
      </body>
    </html>
  );
}
