import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/auth";
import { NavBar } from "~/app/nav-bar";

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
        <NavBar sessionUser={session ? session.user : undefined} />
        <main className="max-w-screen z-0 mb-12 overflow-hidden md:my-0">
          {children}
        </main>
      </body>
    </html>
  );
}
