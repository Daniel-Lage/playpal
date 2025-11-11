import Image from "next/image";
import Link from "next/link";

export function SpotifyLink({ external_url }: { external_url: string }) {
  return (
    <Link
      href={external_url}
      className="h-fit shrink-0 grow-0 rounded-md p-2 hover:backdrop-brightness-95"
    >
      <Image
        height={24}
        width={24}
        src="/spotify-icon.svg"
        alt="spotify icon"
      />
    </Link>
  );
}
