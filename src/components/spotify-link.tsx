import Image from "next/image";
import Link from "next/link";

export function SpotifyLink({ external_url }: { external_url: string }) {
  return (
    <Link
      href={external_url}
      className="flex h-8 w-8 shrink-0 grow-0 items-center justify-center rounded-md hover:backdrop-brightness-95"
    >
      <Image
        height={24}
        width={24}
        className="aspect-square h-auto w-6 flex-shrink-0 flex-grow-0 rounded-md"
        src="/spotify-icon.svg"
        alt="spotify icon"
      />
    </Link>
  );
}
