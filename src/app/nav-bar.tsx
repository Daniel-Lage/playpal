import Image from "next/image";
import Link from "next/link";
import type { LinkParams } from "~/models/link.model";

export function NavBar({ profileURL }: { profileURL: string }) {
  const navTabs: LinkParams[] = [
    { title: "Profile", path: profileURL, icon: "/profile.png" },
    { title: "Home", path: "/", icon: "/home.png" },
    { title: "Search", path: "/search", icon: "/search.png" },
  ];

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
      {navTabs.map(({ title, path, icon }) => (
        <div
          className="flex w-full items-center justify-center md:justify-start"
          key={title}
        >
          <Link href={path} className="flex items-end gap-2" role="button">
            <Image height={32} width={32} src={icon ?? ""} alt={icon ?? ""} />
            <div className="hidden md:block">{title}</div>
          </Link>
        </div>
      ))}
    </div>
  );
}
