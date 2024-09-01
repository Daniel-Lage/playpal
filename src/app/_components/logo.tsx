import Image from "next/image";

export function Logo() {
  return (
    <Image
      className="rounded-md"
      width={48}
      height={48}
      src="/favicon.ico"
      alt="playpal logo"
    />
  );
}
