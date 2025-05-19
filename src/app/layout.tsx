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
      <body className="flex h-svh flex-col-reverse overflow-hidden md:flex-row">
        <StartNav
          profileURL={session ? `/user/${session?.user.id}` : undefined}
        />
        <main className="grow overflow-scroll overflow-x-hidden md:h-svh">
          <div className="flex h-max grow flex-col gap-2 p-2 md:gap-4 md:p-4">
            {children}
          </div>
        </main>
        <EndNav sessionUserImage={session?.user?.image} />
      </body>
    </html>
  );
}
