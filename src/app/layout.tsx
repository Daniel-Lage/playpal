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
        <main className="my-12 mr-[10px] flex h-max grow flex-col gap-2 p-2 md:my-0 md:ml-[19vw] md:mr-[calc(19vw+10px)] md:gap-4 md:p-4">
          {children}
        </main>
        <EndNav sessionUserImage={session?.user?.image} />
      </body>
    </html>
  );
}
