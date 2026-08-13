import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "~/lib/auth";
import { parseBooleanCookie } from "~/helpers/parse-cookie";
import { getCookiePrefix } from "~/helpers/get-cookie-prefix";
import { PlayPalLayoutView } from "~/components/views/playpal-layout-view";

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
  main,
  side,
}: Readonly<{ main: React.ReactNode; side: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();

  const cookiePrefix = getCookiePrefix(session?.user.id);

  const initialNavBarCollapsed = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}nav_bar_collapsed`)?.value,
  );

  const initialSideBarCollapsed = parseBooleanCookie(
    cookieStore.get(`${cookiePrefix}side_bar_collapsed`)?.value,
  );

  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="flex h-screen w-svw flex-col-reverse overflow-hidden md:flex-row">
        <PlayPalLayoutView
          sessionUser={session?.user}
          main={main}
          side={side}
          initialNavBarCollapsed={initialNavBarCollapsed}
          initialSideBarCollapsed={initialSideBarCollapsed}
        />
      </body>
    </html>
  );
}
