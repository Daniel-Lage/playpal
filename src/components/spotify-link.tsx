import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export function SpotifyLink({ external_url }: { external_url: string }) {
  return (
    <Button>
      <Link href={external_url}>
        <Image
          height={24}
          width={24}
          src="/spotify-icon.svg"
          alt="spotify icon"
        />
      </Link>
    </Button>
  );
}
