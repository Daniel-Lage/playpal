import Image from "next/image";
import Link from "next/link";

export function SpotifyLink({
  external_url,
  size,
}: {
  external_url: string;
  size: number;
}) {
  return (
    <Link href={external_url} className="">
      <Image height={size} width={size} src="/spotify.png" alt="spotify icon" />
    </Link>
  );
}
