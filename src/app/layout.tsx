import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "PlayPal",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

function BottomNav() {
  return (
    <div className="bg-zing-300 fixed bottom-0 flex w-full justify-around rounded-t-3xl bg-gray-800 py-3 font-bold text-gray-300">
      <a>Profile</a>
      <a>Home</a>
      <a>Preferences</a>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex flex-col items-center bg-gray-950">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
