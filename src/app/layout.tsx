import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "~/lib/auth";
import { NavBar } from "~/app/nav-bar";

function storageKeyToCookieName(key: string) {
  return `playpal.${key.replaceAll(":", ".")}`;
}

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
  const cookieStore = cookies();

  const navBarCollapsedKey = session?.user.id
    ? `${session.user.id}:nav_bar_collapsed`
    : "nav_bar_collapsed";

  const initialNavBarCollapsed =
    cookieStore.get(storageKeyToCookieName(navBarCollapsedKey))?.value ===
    "true";

  console.log(initialNavBarCollapsed, "initialNavBarCollapsed");

  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="overflow-x-hidden">
        <NavBar
          sessionUser={session ? session.user : undefined}
          initialCollapsed={initialNavBarCollapsed}
        />
        <main className="max-w-screen z-0 mb-24 overflow-hidden md:my-0">
          {children}
        </main>
      </body>
    </html>
  );
}
